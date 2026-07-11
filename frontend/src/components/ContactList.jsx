import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuth.store";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

const ContactList = () => {
  const {
    getAllContacts,
    allContacts,
    selectedUsers,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) {
    return <UsersLoadingSkeleton />;
  }

  if (!allContacts.length) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        No contacts found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allContacts.map((contact) => {
        const isActive = selectedUsers?._id === contact._id;
        const isOnline = onlineUsers.includes(contact._id);

        return (
          <button
            key={contact._id}
            onClick={() => setSelectedUser(contact)}
            className={`
              group
              relative
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              px-4
              py-3
              text-left
              transition-all
              duration-300

              ${
                isActive
                  ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,.15)]"
                  : "border-white/5 bg-white/[0.03] hover:border-cyan-400/20 hover:bg-white/[0.05]"
              }
            `}
          >
            {/* Active Indicator */}
            {isActive && (
              <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-cyan-400" />
            )}

            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={contact.profilePic || "/avatar.png"}
                alt={contact.fullName}
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
              />

              {isOnline && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#05070A] bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,.8)]" />
              )}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-white">
                {contact.fullName}
              </h4>

              <p
                className={`mt-1 text-xs ${
                  isOnline ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ContactList;
