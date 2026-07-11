import { create } from "zustand";
import { useAuthStore } from "./useAuth.store";
import toast from "react-hot-toast";

// RTCPeerConnection ICE configuration
const ICE_CONFIG = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
    // Free TURN servers for NAT traversal
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

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
        o1.connect(g); o2.connect(g); g.connect(this.ctx.destination);
        o1.start(); o2.start();
        setTimeout(() => {
          try { o1.stop(); o2.stop(); o1.disconnect(); o2.disconnect(); g.disconnect(); } catch (e) {}
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
          o.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + delay + 0.25);
          g.gain.setValueAtTime(0, this.ctx.currentTime + delay);
          g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + delay + 0.05);
          g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + 0.35);
          o.connect(g); g.connect(this.ctx.destination);
          o.start(this.ctx.currentTime + delay);
          setTimeout(() => {
            try { o.stop(); o.disconnect(); g.disconnect(); } catch (e) {}
          }, (delay + 0.5) * 1000);
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

// ─── Helper: build a PeerConnection with all handlers ────────────────────────
/**
 * @param {object} opts
 * @param {import('socket.io-client').Socket} opts.socket
 * @param {string} opts.targetId
 * @param {(stream: MediaStream) => void} opts.onRemoteTrack  - called when tracks arrive
 * @param {(state: string) => void} opts.onIceStateChange
 */
function buildPeerConnection({ socket, targetId, onRemoteTrack, onIceStateChange }) {
  const pc = new RTCPeerConnection(ICE_CONFIG);

  // Single stable MediaStream — tracks are added to it, the object reference never changes
  const remoteMediaStream = new MediaStream();

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", { targetId, candidate: event.candidate });
    }
  };

  pc.ontrack = (event) => {
    console.log("[WebRTC] ontrack fired, track kind:", event.track.kind, "streams:", event.streams.length);
    const incomingStream = event.streams && event.streams[0];
    const tracks = incomingStream ? incomingStream.getTracks() : [event.track];
    tracks.forEach((track) => {
      if (!remoteMediaStream.getTrackById(track.id)) {
        remoteMediaStream.addTrack(track);
        console.log("[WebRTC] Added remote track:", track.kind, track.id);
      }
    });
    // Notify caller — pass same object every time so no new React render is triggered
    onRemoteTrack(remoteMediaStream);
  };

  pc.oniceconnectionstatechange = () => {
    console.log("[WebRTC] ICE state:", pc.iceConnectionState);
    if (pc.iceConnectionState === "failed") {
      console.warn("[WebRTC] ICE failed — attempting restartIce()...");
      try { pc.restartIce(); } catch (e) { console.error(e); }
    }
    if (onIceStateChange) onIceStateChange(pc.iceConnectionState);
  };

  pc.onconnectionstatechange = () => {
    console.log("[WebRTC] Connection state:", pc.connectionState);
  };

  return { pc, remoteMediaStream };
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useVideoCallStore = create((set, get) => ({
  callState: "idle",   // 'idle' | 'ringing-outgoing' | 'ringing-incoming' | 'active'
  callerInfo: null,    // { _id, fullName, profilePic }
  localStream: null,
  remoteStream: null,  // Only set when ontrack actually fires — never set to empty stream
  isMuted: false,
  isCameraOff: false,
  peerConnection: null,
  incomingOffer: null,

  // ── Start Outgoing Call ────────────────────────────────────────────────────
  startCall: async (targetUser) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) { toast.error("Socket not connected"); return; }

    set({ callState: "ringing-outgoing", callerInfo: targetUser, remoteStream: null });
    ringtone.playOutgoing();
    pendingIceCandidates = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ localStream: stream });

      const { pc } = buildPeerConnection({
        socket,
        targetId: targetUser._id,
        onRemoteTrack: (ms) => {
          // Only update Zustand if the reference differs (it won't after first call, by design)
          if (get().remoteStream !== ms) {
            set({ remoteStream: ms });
          }
        },
        onIceStateChange: (state) => {
          if (state === "failed") {
            toast.error("Video connection failed. Please try again.");
            get().resetCallState();
          }
        },
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

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

      set({ peerConnection: pc });
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not access camera/microphone");
      get().resetCallState();
    }
  },

  // ── Receive Incoming Call ──────────────────────────────────────────────────
  handleIncomingCall: (offer, callerInfo) => {
    if (get().callState !== "idle") {
      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("video-call-declined", { targetId: callerInfo._id });
      return;
    }
    set({ callState: "ringing-incoming", callerInfo, incomingOffer: offer, remoteStream: null });
    ringtone.playIncoming();
    pendingIceCandidates = [];
  },

  // ── Accept Incoming Call ───────────────────────────────────────────────────
  acceptCall: async () => {
    const { callerInfo, incomingOffer } = get();
    const socket = useAuthStore.getState().socket;
    if (!callerInfo || !incomingOffer || !socket) {
      toast.error("No active call to accept");
      return;
    }
    ringtone.stop();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ localStream: stream, callState: "active" });

      const { pc } = buildPeerConnection({
        socket,
        targetId: callerInfo._id,
        onRemoteTrack: (ms) => {
          if (get().remoteStream !== ms) {
            set({ remoteStream: ms });
          }
        },
        onIceStateChange: (state) => {
          if (state === "failed") {
            toast.error("Video connection failed. Please try again.");
            get().resetCallState();
          }
        },
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // IMPORTANT: set ontrack BEFORE setRemoteDescription so we don't miss early tracks
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("video-call-accepted", { targetId: callerInfo._id, answer });

      // Flush pending ICE candidates
      for (const candidate of pendingIceCandidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding queued ICE candidate:", e);
        }
      }
      pendingIceCandidates = [];

      set({ peerConnection: pc });
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Could not access camera/microphone");
      socket.emit("video-call-declined", { targetId: callerInfo._id });
      get().resetCallState();
    }
  },

  // ── Decline Incoming Call ──────────────────────────────────────────────────
  declineCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket) socket.emit("video-call-declined", { targetId: callerInfo._id });
    get().resetCallState();
  },

  // ── Cancel Outgoing Call ───────────────────────────────────────────────────
  cancelCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket) socket.emit("video-call-cancelled", { targetId: callerInfo._id });
    get().resetCallState();
  },

  // ── End Active Call ────────────────────────────────────────────────────────
  endCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket) socket.emit("end-video-call", { targetId: callerInfo._id });
    get().resetCallState();
  },

  // ── Toggle Mute ────────────────────────────────────────────────────────────
  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
      set({ isMuted: !isMuted });
    }
  },

  // ── Toggle Camera ──────────────────────────────────────────────────────────
  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => { t.enabled = isCameraOff; });
      set({ isCameraOff: !isCameraOff });
    }
  },

  // ── Handle Call Accepted (caller side) ────────────────────────────────────
  handleCallAccepted: async (answer) => {
    const { peerConnection } = get();
    if (!peerConnection) return;
    ringtone.stop();
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      set({ callState: "active" });

      // Flush pending ICE candidates
      for (const candidate of pendingIceCandidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
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

  handleCallDeclined:  () => { toast.error("Call declined");            get().resetCallState(); },
  handleCallCancelled: () => { toast.error("Call cancelled by caller"); get().resetCallState(); },
  handleCallEnded:     () => { toast("Call ended", { icon: "📞" });     get().resetCallState(); },

  // ── Handle Remote ICE Candidate ────────────────────────────────────────────
  handleRemoteIceCandidate: async (candidate) => {
    const { peerConnection } = get();
    if (peerConnection && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding remote ICE candidate:", e);
      }
    } else {
      pendingIceCandidates.push(candidate);
    }
  },

  // ── Reset Call State ───────────────────────────────────────────────────────
  resetCallState: () => {
    const { localStream, peerConnection } = get();
    ringtone.stop();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    if (peerConnection) peerConnection.close();
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
