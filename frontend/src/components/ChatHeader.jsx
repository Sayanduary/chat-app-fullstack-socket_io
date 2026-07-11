import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuth.store";

const ChatHeader = () => {
  const { selectedUsers, setSelectedUser, isTyping } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = selectedUsers
    ? onlineUsers.includes(selectedUsers._id)
    : false;

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
    <header className="flex h-20 items-center justify-between border-b border-slate-800/70 bg-black/40 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={selectedUsers.profilePic || "/avatar.png"}
            alt={selectedUsers.fullName}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700"
          />

          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,.8)]" />
          )}
        </div>

        <div>
          <h3 className="font-semibold text-white">{selectedUsers.fullName}</h3>

          {isTyping ? (
            <div className="mt-1 flex items-center gap-1 text-sm text-cyan-400">
              <span>Typing</span>

              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:.15s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:.3s]"></span>
              </span>
            </div>
          ) : (
            <p
              className={`mt-1 text-sm ${
                isOnline ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => setSelectedUser(null)}
        className="rounded-lg p-2 transition hover:bg-slate-800"
      >
        <XIcon className="h-5 w-5 text-slate-400 hover:text-white" />
      </button>
    </header>
  );
};

export default ChatHeader;
