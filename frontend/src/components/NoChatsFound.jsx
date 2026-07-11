import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-500/10">
        <MessageCircleIcon className="h-8 w-8 text-cyan-300" />
      </div>
      <div>
        <h4 className="mb-1 font-medium text-slate-100">
          No conversations yet
        </h4>
        <p className="px-6 text-sm text-slate-400">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="rounded-xl border border-cyan-400/15 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition-colors hover:bg-cyan-500/16 hover:text-cyan-200"
      >
        Find contacts
      </button>
    </div>
  );
}
export default NoChatsFound;
