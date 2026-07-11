import { create } from "zustand";
import { useAuthStore } from "./useAuth.store";
import toast from "react-hot-toast";

// RTCPeerConnection Ice configuration
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
    // Free TURN servers for NAT traversal (prevents freeze on restricted networks)
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

class RingtoneManager {
  constructor() {
    this.ctx = null;
    this.interval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playOutgoing() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
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
          try { o1.stop(); o2.stop(); o1.disconnect(); o2.disconnect(); g.disconnect(); } catch(e){}
        }, 2200);
      };
      beep();
      this.interval = setInterval(beep, 4000);
    } catch(e) {
      console.warn("AudioContext failed to start:", e);
    }
  }

  playIncoming() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
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
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(this.ctx.currentTime + delay);
          setTimeout(() => {
            try { o.stop(); o.disconnect(); g.disconnect(); } catch(e){}
          }, (delay + 0.5) * 1000);
        };
        playTone(0);
        playTone(0.4);
      };
      beep();
      this.interval = setInterval(beep, 2500);
    } catch(e) {
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

export const useVideoCallStore = create((set, get) => ({
  callState: "idle", // 'idle' | 'ringing-outgoing' | 'ringing-incoming' | 'active'
  callerInfo: null, // { _id, fullName, profilePic }
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCameraOff: false,
  peerConnection: null,
  incomingOffer: null,

  // Start an Outgoing Call
  startCall: async (targetUser) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      toast.error("Socket not connected");
      return;
    }

    set({ callState: "ringing-outgoing", callerInfo: targetUser });
    ringtone.playOutgoing();
    pendingIceCandidates = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ localStream: stream });

      const pc = new RTCPeerConnection(ICE_CONFIG);

      // Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            targetId: targetUser._id,
            candidate: event.candidate,
          });
        }
      };

      // Handle remote stream tracks
      // Use a stable MediaStream so React doesn't re-render and reset the video srcObject
      const remoteStream = new MediaStream();
      set({ remoteStream });
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          // Avoid adding duplicate tracks
          if (!remoteStream.getTrackById(track.id)) {
            remoteStream.addTrack(track);
          }
        });
      };

      // Create offer
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

      // Monitor ICE connection state to detect and handle failures
      pc.oniceconnectionstatechange = () => {
        console.log("[WebRTC] ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          console.warn("[WebRTC] ICE connection failed, attempting restart...");
          pc.restartIce();
        }
        if (pc.iceConnectionState === "disconnected") {
          console.warn("[WebRTC] ICE disconnected, waiting for reconnect...");
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("[WebRTC] Peer connection state:", pc.connectionState);
        if (pc.connectionState === "failed") {
          toast.error("Video connection failed. Please try again.");
          get().resetCallState();
        }
      };

      set({ peerConnection: pc });
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not access camera/microphone");
      get().resetCallState();
    }
  },

  // Receive Incoming Call (Triggered by socket listener)
  handleIncomingCall: (offer, callerInfo) => {
    // If already in a call, auto-decline
    if (get().callState !== "idle") {
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("video-call-declined", { targetId: callerInfo._id });
      }
      return;
    }

    set({
      callState: "ringing-incoming",
      callerInfo,
      incomingOffer: offer,
    });
    ringtone.playIncoming();
    pendingIceCandidates = [];
  },

  // Accept Incoming Call
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

      const pc = new RTCPeerConnection(ICE_CONFIG);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            targetId: callerInfo._id,
            candidate: event.candidate,
          });
        }
      };

      // Use a stable MediaStream so React doesn't re-render and reset the video srcObject
      const remoteStream = new MediaStream();
      set({ remoteStream });
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          if (!remoteStream.getTrackById(track.id)) {
            remoteStream.addTrack(track);
          }
        });
      };

      // Set offer description
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("video-call-accepted", {
        targetId: callerInfo._id,
        answer,
      });

      // Process pending candidates
      for (const candidate of pendingIceCandidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding queued ice candidate", e);
        }
      }
      pendingIceCandidates = [];

      // Monitor ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log("[WebRTC] ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          console.warn("[WebRTC] ICE connection failed, attempting restart...");
          pc.restartIce();
        }
        if (pc.iceConnectionState === "disconnected") {
          console.warn("[WebRTC] ICE disconnected, waiting for reconnect...");
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("[WebRTC] Peer connection state:", pc.connectionState);
        if (pc.connectionState === "failed") {
          toast.error("Video connection failed. Please try again.");
          get().resetCallState();
        }
      };

      set({ peerConnection: pc });
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Could not access camera/microphone");
      socket.emit("video-call-declined", { targetId: callerInfo._id });
      get().resetCallState();
    }
  },

  // Decline Incoming Call
  declineCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket) {
      socket.emit("video-call-declined", { targetId: callerInfo._id });
    }
    get().resetCallState();
  },

  // Cancel Outgoing Call
  cancelCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket) {
      socket.emit("video-call-cancelled", { targetId: callerInfo._id });
    }
    get().resetCallState();
  },

  // End active call (initiated by user)
  endCall: () => {
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;
    if (callerInfo && socket) {
      socket.emit("end-video-call", { targetId: callerInfo._id });
    }
    get().resetCallState();
  },

  // Toggle Mute (Microphone)
  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // Toggle enabled state
      });
      set({ isMuted: !isMuted });
    }
  },

  // Toggle Camera (Video)
  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOff; // Toggle enabled state
      });
      set({ isCameraOff: !isCameraOff });
    }
  },

  // Socket callback handlers
  handleCallAccepted: async (answer) => {
    const { peerConnection } = get();
    if (!peerConnection) return;

    ringtone.stop();

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      set({ callState: "active" });

      // Process pending candidates
      for (const candidate of pendingIceCandidates) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding queued ice candidate", e);
        }
      }
      pendingIceCandidates = [];
    } catch (error) {
      console.error("Error setting remote description on accepted call:", error);
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
    if (peerConnection && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding remote ice candidate:", e);
      }
    } else {
      pendingIceCandidates.push(candidate);
    }
  },

  resetCallState: () => {
    const { localStream, peerConnection } = get();

    ringtone.stop();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
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
