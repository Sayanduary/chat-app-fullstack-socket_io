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
      <div className="flex flex-1 items-center justify-center text-slate-400">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">
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
                        ? "rounded-br-md bg-cyan-500 text-white"
                        : "rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="attachment"
                        className="mb-2 max-w-xs rounded-xl"
                      />
                    )}

                    {message.text && (
                      <p className="whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    )}

                    <div
                      className={`mt-2 text-[11px] ${
                        isSender ? "text-cyan-100" : "text-slate-400"
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
