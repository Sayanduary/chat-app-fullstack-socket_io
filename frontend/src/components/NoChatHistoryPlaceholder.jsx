import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/15 bg-gradient-to-br from-cyan-500/15 to-cyan-400/8">
        <MessageCircleIcon className="size-8 text-cyan-300" />
      </div>
      <h3 className="mb-3 text-lg font-medium text-slate-100">
        Start your conversation with {name}
      </h3>
      <div className="mb-5 flex max-w-md flex-col space-y-3">
        <p className="text-sm text-slate-400">
          This is the beginning of your conversation. Send a message to start
          chatting!
        </p>
        <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent"></div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/18">
          Say Hello
        </button>
        <button className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/18">
          How are you?
        </button>
        <button className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/18">
          Meet up soon?
        </button>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
