import { useEffect, useRef, useState } from "react";
import {
  ImageIcon,
  SendHorizontalIcon,
  XIcon,
  Loader2Icon,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const typingTimeout = useRef(null);

  const { sendMessage, isSendingMessage, startTyping, stopTyping } =
    useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
      stopTyping();
    };
  }, [stopTyping]);

  const removeImage = () => {
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      stopTyping();

      clearTimeout(typingTimeout.current);

      setText("");
      removeImage();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="shrink-0 border-t border-white/10 bg-black/35 p-3 backdrop-blur-2xl sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-5xl flex-col gap-2.5 sm:gap-3"
      >
        {imagePreview && (
          <div className="relative w-fit">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-40 rounded-2xl border border-white/10 object-cover shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:max-h-48"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 rounded-full border border-white/10 bg-[#05070a] p-1 text-slate-300 transition hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-slate-400 transition hover:border-cyan-400/25 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ImageIcon className="h-5 w-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />

          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              const value = e.target.value;

              setText(value);

              clearTimeout(typingTimeout.current);

              if (value.trim()) {
                startTyping();

                typingTimeout.current = setTimeout(() => {
                  stopTyping();
                }, 1000);
              } else {
                stopTyping();
              }
            }}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/15 sm:text-base"
            onBlur={() => {
              clearTimeout(typingTimeout.current);
              stopTyping();
            }}
          />

          <button
            type="submit"
            disabled={(!text.trim() && !imagePreview) || isSendingMessage}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500 to-teal-400 text-white shadow-[0_16px_40px_rgba(34,211,238,0.16)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
          >
            {isSendingMessage ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontalIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
