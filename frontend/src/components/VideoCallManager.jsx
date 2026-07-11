import { useEffect, useRef } from "react";
import { useVideoCallStore } from "../store/useVideoCallStore";
import { useAuthStore } from "../store/useAuth.store";
import { getSafeImageSrc } from "../lib/url";
import { PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

const VideoCallManager = () => {
  const {
    callState,
    callerInfo,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    acceptCall,
    declineCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleCamera,
    handleIncomingCall,
    handleCallAccepted,
    handleCallDeclined,
    handleCallCancelled,
    handleCallEnded,
    handleRemoteIceCandidate,
  } = useVideoCallStore();

  const socket = useAuthStore((state) => state.socket);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Subscribe to socket events
  useEffect(() => {
    if (!socket) return;

    const onOffer = ({ offer, callerInfo }) => {
      handleIncomingCall(offer, callerInfo);
    };

    const onAccepted = ({ answer }) => {
      handleCallAccepted(answer);
    };

    const onDeclined = () => {
      handleCallDeclined();
    };

    const onCancelled = () => {
      handleCallCancelled();
    };

    const onIce = ({ candidate }) => {
      handleRemoteIceCandidate(candidate);
    };

    const onEnded = () => {
      handleCallEnded();
    };

    socket.on("video-call-offer", onOffer);
    socket.on("video-call-accepted", onAccepted);
    socket.on("video-call-declined", onDeclined);
    socket.on("video-call-cancelled", onCancelled);
    socket.on("ice-candidate", onIce);
    socket.on("end-video-call", onEnded);

    return () => {
      socket.off("video-call-offer", onOffer);
      socket.off("video-call-accepted", onAccepted);
      socket.off("video-call-declined", onDeclined);
      socket.off("video-call-cancelled", onCancelled);
      socket.off("ice-candidate", onIce);
      socket.off("end-video-call", onEnded);
    };
  }, [
    socket,
    handleIncomingCall,
    handleCallAccepted,
    handleCallDeclined,
    handleCallCancelled,
    handleCallEnded,
    handleRemoteIceCandidate,
  ]);

  // Bind streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      // Only reassign srcObject if it actually changed to avoid interrupting the stream
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  if (callState === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-300">
      {/* 1. OUTGOING CALL SCREEN */}
      {callState === "ringing-outgoing" && callerInfo && (
        <div className="flex flex-col items-center max-w-sm w-full text-center">
          <div className="relative mb-8">
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping scale-150" />
            <div className="absolute -inset-4 rounded-full border border-cyan-500/30 animate-pulse" />
            <img
              src={getSafeImageSrc(callerInfo.profilePic)}
              alt={callerInfo.fullName}
              className="relative z-10 w-32 h-32 rounded-full object-cover border-4 border-cyan-500/50 shadow-2xl shadow-cyan-500/20"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{callerInfo.fullName}</h2>
          <p className="text-slate-400 animate-pulse text-sm tracking-wider uppercase mb-12">Ringing...</p>

          <button
            onClick={cancelCall}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white hover:scale-105 cursor-pointer"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* 2. INCOMING CALL MODAL */}
      {callState === "ringing-incoming" && callerInfo && (
        <div className="bg-slate-900/95 border border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-125" />
            <img
              src={getSafeImageSrc(callerInfo.profilePic)}
              alt={callerInfo.fullName}
              className="relative z-10 w-24 h-24 rounded-full object-cover border-4 border-emerald-500/50 shadow-lg"
            />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{callerInfo.fullName}</h2>
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
            Incoming Video Call...
          </p>

          <div className="flex justify-center gap-6">
            <button
              onClick={declineCall}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/50 text-red-200 hover:text-white transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
            <button
              onClick={acceptCall}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Video className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE CALL SCREEN */}
      {callState === "active" && callerInfo && (
        <div className="relative w-full h-full max-w-6xl rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col items-center justify-center">
          {/* Remote Video (Fullscreen inside container) */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            {/* Connecting placeholder overlay */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-center px-4 z-10 transition-opacity duration-300 ${
              remoteStream ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
            }`}>
              <img
                src={getSafeImageSrc(callerInfo.profilePic)}
                alt={callerInfo.fullName}
                className="w-24 h-24 rounded-full object-cover border-2 border-white/20 mb-4 animate-pulse"
              />
              <p className="text-slate-400 text-sm animate-pulse">Connecting video stream...</p>
            </div>

            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Local Video (Floating overlay on top right) */}
          <div className="absolute top-4 right-4 w-32 h-44 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20 bg-slate-900">
            {/* Camera Off Placeholder Overlay */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center z-10 transition-opacity duration-300 ${
              isCameraOff ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}>
              <VideoOff className="w-8 h-8 mb-2" />
              <span className="text-[10px] sm:text-xs">Camera Off</span>
            </div>

            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]" // Mirror local stream
            />
          </div>

          {/* Floating Caller Name Overlay (Top Left) */}
          <div className="absolute top-4 left-4 z-10 bg-black/40 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3">
            <img
              src={getSafeImageSrc(callerInfo.profilePic)}
              alt={callerInfo.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-xs font-semibold">{callerInfo.fullName}</p>
              <p className="text-emerald-400 text-[10px] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </p>
            </div>
          </div>

          {/* Controls Bar (Floating bottom) */}
          <div className="absolute bottom-6 z-20 bg-black/50 border border-white/10 backdrop-blur-md px-6 py-4 rounded-full flex gap-6 items-center shadow-2xl">
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-full border transition-all duration-300 cursor-pointer ${
                isMuted
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white/5 border-white/10 hover:bg-white/15 text-slate-200"
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-white hover:scale-105 cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleCamera}
              className={`p-3.5 rounded-full border transition-all duration-300 cursor-pointer ${
                isCameraOff
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white/5 border-white/10 hover:bg-white/15 text-slate-200"
              }`}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallManager;
