import { create } from "zustand";
import { useAuthStore } from "./useAuth.store";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// ─── ICE Server Config ───────────────────────────────────────────────────────
const STUN_ONLY_CONFIG = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

let _cachedIceServers = null;

async function fetchIceConfig() {
  if (_cachedIceServers) return _cachedIceServers;
  try {
    const { data } = await axiosInstance.get("/ice-servers");
    const config = {
      iceServers: data.iceServers,
      iceCandidatePoolSize: 10,
    };
    _cachedIceServers = config;
    return config;
  } catch (err) {
    console.warn(
      "[ICE] Could not fetch ICE servers from backend, using STUN only:",
      err.message,
    );
    return STUN_ONLY_CONFIG;
  }
}

// ─── Ringtone Manager ────────────────────────────────────────────────────────
class RingtoneManager {
  constructor() {
    this.ctx = null;
    this.interval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playOutgoing() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      this.stop();
      const beep = () => {
        if (!this.ctx) return;
        const o1 = this.ctx.createOscillator();
        const o2 = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o1.frequency.value = 440;
        o2.frequency.value = 480;
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime + 1.8);
        g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.0);
        o1.connect(g);
        o2.connect(g);
        g.connect(this.ctx.destination);
        o1.start();
        o2.start();
        setTimeout(() => {
          try {
            o1.stop();
            o2.stop();
            o1.disconnect();
            o2.disconnect();
            g.disconnect();
          } catch (e) {
            console.log(e);
          }
        }, 2200);
      };
      beep();
      this.interval = setInterval(beep, 4000);
    } catch (e) {
      console.warn("AudioContext failed to start:", e);
    }
  }

  playIncoming() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      this.stop();
      const beep = () => {
        if (!this.ctx) return;
        const playTone = (delay) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(800, this.ctx.currentTime + delay);
          o.frequency.exponentialRampToValueAtTime(
            600,
            this.ctx.currentTime + delay + 0.25,
          );
          g.gain.setValueAtTime(0, this.ctx.currentTime + delay);
          g.gain.linearRampToValueAtTime(
            0.15,
            this.ctx.currentTime + delay + 0.05,
          );
          g.gain.linearRampToValueAtTime(
            0,
            this.ctx.currentTime + delay + 0.35,
          );
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(this.ctx.currentTime + delay);
          setTimeout(
            () => {
              try {
                o.stop();
                o.disconnect();
                g.disconnect();
              } catch (e) {
                console.log(e);
              }
            },
            (delay + 0.5) * 1000,
          );
        };
        playTone(0);
        playTone(0.4);
      };
      beep();
      this.interval = setInterval(beep, 2500);
    } catch (e) {
      console.warn("AudioContext failed to start:", e);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

const ringtone = new RingtoneManager();
let pendingIceCandidates = [];

// ─── PeerConnection Builder ──────────────────────────────────────────────────
function buildPeerConnection({
  socket,
  targetId,
  iceConfig,
  onRemoteTrack,
  onFatalFailure,
}) {
  const pc = new RTCPeerConnection(iceConfig);
  const remoteMediaStream = new MediaStream();
  let iceRestartAttempts = 0;
  const MAX_ICE_RESTARTS = 3;

  let disconnectTimer = null;
  let gatheringTimeout = null;
  const DISCONNECT_GRACE_MS = 6000;
  const ICE_GATHERING_TIMEOUT_MS = 15000;

  pc.onicecandidate = ({ candidate }) => {
    if (!candidate) return;
    socket.emit("ice-candidate", { targetId, candidate });
  };

  pc.onicegatheringstatechange = () => {
    if (pc.iceGatheringState === "gathering") {
      clearTimeout(gatheringTimeout);
      gatheringTimeout = setTimeout(() => {
        console.warn("[WebRTC] ICE gathering taking longer than expected.");
      }, ICE_GATHERING_TIMEOUT_MS);
    }
    if (pc.iceGatheringState === "complete") {
      clearTimeout(gatheringTimeout);
    }
  };

  pc.onicecandidateerror = (event) => {
    console.error("[WebRTC] ICE Candidate Error", {
      url: event.url,
      errorCode: event.errorCode,
      errorText: event.errorText,
    });
  };

  pc.ontrack = (event) => {
    const stream =
      event.streams && event.streams.length ? event.streams[0] : null;
    const tracks = stream ? stream.getTracks() : [event.track];

    tracks.forEach((track) => {
      if (!remoteMediaStream.getTrackById(track.id)) {
        remoteMediaStream.addTrack(track);
      }
    });
    onRemoteTrack(remoteMediaStream);
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed") {
      clearTimeout(disconnectTimer);
      if (onFatalFailure) onFatalFailure();
    }
  };

  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState;
    if (state === "connected" || state === "completed") {
      clearTimeout(disconnectTimer);
      iceRestartAttempts = 0;
    } else if (state === "disconnected") {
      clearTimeout(disconnectTimer);
      disconnectTimer = setTimeout(() => {
        if (
          pc.connectionState === "closed" ||
          pc.iceConnectionState !== "disconnected"
        )
          return;
        if (iceRestartAttempts >= MAX_ICE_RESTARTS) {
          onFatalFailure?.();
          return;
        }
        iceRestartAttempts++;
        try {
          pc.restartIce();
        } catch (err) {
          console.error(err);
        }
      }, DISCONNECT_GRACE_MS);
    } else if (state === "failed") {
      clearTimeout(disconnectTimer);
      if (iceRestartAttempts >= MAX_ICE_RESTARTS) {
        onFatalFailure?.();
        return;
      }
      iceRestartAttempts++;
      try {
        pc.restartIce();
      } catch (err) {
        onFatalFailure?.();
        console.log(err);
      }
    }
  };

  function cleanup() {
    clearTimeout(disconnectTimer);
    clearTimeout(gatheringTimeout);
    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.oniceconnectionstatechange = null;
    pc.onicegatheringstatechange = null;
    pc.onicecandidateerror = null;
    pc.onsignalingstatechange = null;
    pc.onconnectionstatechange = null;
    pc.onnegotiationneeded = null;
    try {
      pc.close();
    } catch (e) {
      console.log(e);
    }
  }

  return { pc, remoteMediaStream, cleanup };
}

// ─── Zustand Store ───────────────────────────────────────────────────────────
export const useVideoCallStore = create((set, get) => ({
  callState: "idle",
  callerInfo: null,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCameraOff: false,
  peerConnection: null, // Holds structured object: { pc, cleanup }
  incomingOffer: null,

  startCall: async (targetUser) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      toast.error("Socket not connected");
      return;
    }

    set({
      callState: "ringing-outgoing",
      callerInfo: targetUser,
      remoteStream: null,
    });
    ringtone.playOutgoing();
    pendingIceCandidates = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      set({ localStream: stream });

      const iceConfig = await fetchIceConfig();
      const connectionGroup = buildPeerConnection({
        socket,
        targetId: targetUser._id,
        iceConfig,
        onRemoteTrack: (remoteStreamRef) => {
          set({ remoteStream: remoteStreamRef });
        },
        onFatalFailure: () => {
          toast.error("Video connection lost. Please call again.");
          get().resetCallState();
        },
      });

      stream
        .getTracks()
        .forEach((track) => connectionGroup.pc.addTrack(track, stream));

      const offer = await connectionGroup.pc.createOffer();
      await connectionGroup.pc.setLocalDescription(offer);

      const authUser = useAuthStore.getState().authUser;
      socket.emit("video-call-offer", {
        targetId: targetUser._id,
        offer,
        callerInfo: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
      });

      set({ peerConnection: connectionGroup });
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not access camera/microphone");
      get().resetCallState();
    }
  },

  handleIncomingCall: (offer, callerInfo) => {
    if (get().callState !== "idle") {
      const socket = useAuthStore.getState().socket;
      if (socket)
        socket.emit("video-call-declined", { targetId: callerInfo._id });
      return;
    }
    set({
      callState: "ringing-incoming",
      callerInfo,
      incomingOffer: offer,
      remoteStream: null,
    });
    ringtone.playIncoming();
    pendingIceCandidates = [];
  },

  acceptCall: async () => {
    const { callerInfo, incomingOffer } = get();
    const socket = useAuthStore.getState().socket;
    if (!callerInfo || !incomingOffer || !socket) {
      toast.error("No active call to accept");
      return;
    }
    ringtone.stop();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      set({ localStream: stream, callState: "active" });

      const iceConfig = await fetchIceConfig();
      const connectionGroup = buildPeerConnection({
        socket,
        targetId: callerInfo._id,
        iceConfig,
        onRemoteTrack: (remoteStreamRef) => {
          set({ remoteStream: remoteStreamRef });
        },
        onFatalFailure: () => {
          toast.error("Video connection lost. Please call again.");
          get().resetCallState();
        },
      });

      stream
        .getTracks()
        .forEach((track) => connectionGroup.pc.addTrack(track, stream));

      await connectionGroup.pc.setRemoteDescription(
        new RTCSessionDescription(incomingOffer),
      );
      const answer = await connectionGroup.pc.createAnswer();
      await connectionGroup.pc.setLocalDescription(answer);

      socket.emit("video-call-accepted", { targetId: callerInfo._id, answer });

      for (const candidate of pendingIceCandidates) {
        try {
          await connectionGroup.pc.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        } catch (e) {
          console.error("Error adding queued ICE candidate:", e);
        }
      }
      pendingIceCandidates = [];

      set({ peerConnection: connectionGroup });
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Could not access camera/microphone");
      socket.emit("video-call-declined", { targetId: callerInfo._id });
      get().resetCallState();
    }
  },

  declineCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket)
      socket.emit("video-call-declined", { targetId: callerInfo._id });
    get().resetCallState();
  },

  cancelCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket)
      socket.emit("video-call-cancelled", { targetId: callerInfo._id });
    get().resetCallState();
  },

  endCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket)
      socket.emit("end-video-call", { targetId: callerInfo._id });
    get().resetCallState();
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
      set({ isMuted: !isMuted });
    }
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = isCameraOff;
      });
      set({ isCameraOff: !isCameraOff });
    }
  },

  handleCallAccepted: async (answer) => {
    const { peerConnection } = get();
    if (!peerConnection) return;

    ringtone.stop();
    try {
      await peerConnection.pc.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      set({ callState: "active" });

      for (const candidate of pendingIceCandidates) {
        try {
          await peerConnection.pc.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        } catch (e) {
          console.error("Error adding queued ICE candidate:", e);
        }
      }
      pendingIceCandidates = [];
    } catch (error) {
      console.error("Error setting remote description:", error);
      toast.error("Failed to establish video connection");
      get().resetCallState();
    }
  },

  handleCallDeclined: () => {
    toast.error("Call declined");
    get().resetCallState();
  },
  handleCallCancelled: () => {
    toast.error("Call cancelled by caller");
    get().resetCallState();
  },
  handleCallEnded: () => {
    toast("Call ended", { icon: "📞" });
    get().resetCallState();
  },

  handleRemoteIceCandidate: async (candidate) => {
    const { peerConnection } = get();
    if (peerConnection?.pc?.remoteDescription) {
      try {
        await peerConnection.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding remote ICE candidate:", e);
      }
    } else {
      pendingIceCandidates.push(candidate);
    }
  },

  resetCallState: () => {
    const { localStream, peerConnection } = get();
    ringtone.stop();

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (peerConnection?.cleanup) {
      peerConnection.cleanup();
    }

    pendingIceCandidates = [];
    set({
      callState: "idle",
      callerInfo: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isCameraOff: false,
      peerConnection: null,
      incomingOffer: null,
    });
  },
}));
