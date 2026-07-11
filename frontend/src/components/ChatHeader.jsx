import { XIcon, Video } from "lucide-react";
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuth.store";
import { getSafeImageSrc } from "../lib/url";
import { useVideoCallStore } from "../store/useVideoCallStore";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUsers, setSelectedUser, isTyping } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useVideoCallStore();

  const isOnline = selectedUsers
    ? onlineUsers.includes(selectedUsers._id)
    : false;

  const handleVideoCall = () => {
    if (!selectedUsers) return;
    if (!isOnline) {
      toast.error(`${selectedUsers.fullName} is offline`);
      return;
    }
    startCall(selectedUsers);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [setSelectedUser]);

  if (!selectedUsers) return null;

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-4 backdrop-blur-2xl sm:h-20 sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="relative">
          <img
            src={getSafeImageSrc(selectedUsers.profilePic)}
            alt={selectedUsers.fullName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 sm:h-12 sm:w-12"
          />

          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,.8)] sm:h-3.5 sm:w-3.5" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white text-sm sm:text-base">
            {selectedUsers.fullName}
          </h3>

          {isTyping ? (
            <div className="mt-1 flex items-center gap-1 text-xs text-cyan-300 sm:text-sm">
              <span>Typing</span>

              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:.15s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:.3s]"></span>
              </span>
            </div>
          ) : (
            <p
              className={`mt-1 text-xs sm:text-sm ${
                isOnline ? "text-emerald-300" : "text-slate-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleVideoCall}
          className="rounded-lg p-2 transition hover:bg-white/[0.06] text-slate-400 hover:text-cyan-400 sm:p-2.5 cursor-pointer"
          title="Video Call"
        >
          <Video className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
        </button>

        <button
          onClick={() => setSelectedUser(null)}
          className="rounded-lg p-2 transition hover:bg-white/[0.06] sm:p-2.5 cursor-pointer"
        >
          <XIcon className="h-4 w-4 text-slate-400 hover:text-white sm:h-5 sm:w-5" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
