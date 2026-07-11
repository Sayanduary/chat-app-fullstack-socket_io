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
    <div className="border-t border-slate-800/80 bg-black/40 p-4 backdrop-blur-xl">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-5xl flex-col gap-3"
      >
        {imagePreview && (
          <div className="relative w-fit">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-48 rounded-xl border border-slate-700 object-cover"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-slate-300 transition hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
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
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-500"
            onBlur={() => {
              clearTimeout(typingTimeout.current);
              stopTyping();
            }}
          />

          <button
            type="submit"
            disabled={(!text.trim() && !imagePreview) || isSendingMessage}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
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
