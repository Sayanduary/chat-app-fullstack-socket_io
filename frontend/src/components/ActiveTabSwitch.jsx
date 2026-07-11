import { MessageCircleIcon, UsersIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ActiveTabSwitch = () => {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => setActiveTab("chats")}
          className={`
            flex items-center justify-center gap-2
            rounded-xl
            px-4 py-2.5
            text-sm font-medium
            transition-all duration-300

            ${
              activeTab === "chats"
                ? `
                  bg-cyan-500/12
                  text-cyan-200
                  border border-cyan-400/20
                  shadow-[0_0_24px_rgba(34,211,238,.12)]
                `
                : `
                  text-slate-400
                  hover:bg-white/[0.05]
                  hover:text-white
                `
            }
          `}
        >
          <MessageCircleIcon className="h-4 w-4" />
          Chats
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`
            flex items-center justify-center gap-2
            rounded-xl
            px-4 py-2.5
            text-sm font-medium
            transition-all duration-300

            ${
              activeTab === "contacts"
                ? `
                  bg-cyan-500/12
                  text-cyan-200
                  border border-cyan-400/20
                  shadow-[0_0_24px_rgba(34,211,238,.12)]
                `
                : `
                  text-slate-400
                  hover:bg-white/[0.05]
                  hover:text-white
                `
            }
          `}
        >
          <UsersIcon className="h-4 w-4" />
          Contacts
        </button>
      </div>
    </div>
  );
};

export default ActiveTabSwitch;
