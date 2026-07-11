import { MessageCircleMoreIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute h-96 w-96 rounded-full bg-cyan-500/8 blur-[140px]" />

      <div className="relative flex max-w-md flex-col items-center text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/18 blur-3xl" />

          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <MessageCircleMoreIcon className="h-14 w-14 text-cyan-300" />
          </div>
        </div>

        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white">
          Welcome to ChatFlow
        </h2>

        <p className="max-w-sm text-base leading-7 text-slate-400">
          Select an existing conversation from the sidebar or start a new chat
          to begin messaging.
        </p>

        <div className="mt-10 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
          <span className="text-sm text-slate-500">
            Waiting for a conversation...
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoConversationPlaceholder;
