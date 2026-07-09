import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";

const ChatsList = () => {
  const {
    getMyChatPartners,
    chats,
    isUserLoading,
    selectedUser,
    setSelectedUser,
  } = useChatStore();

  useEffect(() => {
    getMyChatPartners();
  }, []);

  if (isUserLoading) {
    return <UsersLoadingSkeleton />;
  }

  if (!chats.length) {
    return <NoChatsFound />;
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        const isActive = selectedUser?._id === chat._id;

        return (
          <button
            key={chat._id}
            onClick={() => setSelectedUser(chat)}
            className={`
              group
              relative
              flex
              w-full
              items-center
              gap-3
              overflow-hidden
              rounded-2xl
              border
              px-4
              py-3
              text-left
              transition-all
              duration-300

              ${
                isActive
                  ? `
                    border-cyan-400/30
                    bg-cyan-500/10
                    shadow-[0_0_30px_rgba(34,211,238,0.12)]
                  `
                  : `
                    border-white/5
                    bg-white/[0.03]
                    hover:border-cyan-400/20
                    hover:bg-white/[0.05]
                  `
              }
            `}
          >
            {/* Active Indicator */}
            {isActive && (
              <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-cyan-400" />
            )}

            {/* Avatar */}
            <img
              src={chat.profilePic || "/avatar.png"}
              alt={chat.fullName}
              className="
                h-12
                w-12
                rounded-xl
                object-cover
                ring-1
                ring-white/10
                transition-transform
                duration-300
                group-hover:scale-105
              "
            />

            {/* User Info */}
            <div className="min-w-0 flex-1 ">
              <h4 className="truncate text-sm font-semibold text-white ">
                {chat.fullName}
              </h4>

              <p className="mt-1 truncate text-xs text-slate-400">
                Start a conversation
              </p>
            </div>

            {/* Reserved for timestamp / unread badge */}
            <div className="flex flex-col items-end gap-2">
              {/* Future:
              <span className="text-xs text-slate-500">
                10:45 AM
              </span>

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold text-white">
                2
              </span>
              */}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatsList;
