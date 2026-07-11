import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuth.store";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessageLoadingSkeleton";

const ChatContainer = () => {
  const {
    selectedUsers,
    getMessagesById,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedUsers) return;

    getMessagesById(selectedUsers._id);

    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
      useChatStore.setState({ isTyping: false });
    };
  }, [
    selectedUsers,
    getMessagesById,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!selectedUsers) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-slate-400">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <ChatHeader />

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-slate-500">
            No messages yet.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isSender =
                (message.senderId?._id || message.senderId)?.toString() ===
                authUser._id.toString();

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                      isSender
                        ? "rounded-br-md border border-cyan-400/20 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-[0_16px_40px_rgba(34,211,238,0.14)]"
                        : "rounded-bl-md border border-white/10 bg-white/[0.04] text-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="attachment"
                        className="mb-2 max-w-full rounded-2xl border border-white/10 sm:max-w-xs"
                      />
                    )}

                    {message.text && (
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 sm:text-base">
                        {message.text}
                      </p>
                    )}

                    <div
                      className={`mt-2 text-[11px] ${
                        isSender ? "text-cyan-100/90" : "text-slate-400"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleString([], {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
