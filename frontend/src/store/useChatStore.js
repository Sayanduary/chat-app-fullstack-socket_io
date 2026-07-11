import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuth.store";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUsers: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  isTyping: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  setSelectedUser: (selectedUsers) => {
    set({ selectedUsers });
  },
  resetChatState: () => {
    set({
      allContacts: [],
      chats: [],
      messages: [],
      activeTab: "chats",
      selectedUsers: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      isSendingMessage: false,
      isTyping: false,
    });
  },
  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something Went Wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something Went Wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessagesById: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something Went Wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUsers } = get();

    try {
      set({ isSendingMessage: true });
      const res = await axiosInstance.post(
        `/messages/send/${selectedUsers._id}`,
        messageData,
      );

      set((state) => ({
        messages: [...state.messages, res.data],
      }));

      return res.data;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMessage: false });
    }
  },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("typing");
    socket.off("stopTyping");
    socket.off("newMessage");

    socket.on("typing", (senderId) => {
      const { selectedUsers } = get();

      if (selectedUsers?._id === senderId) {
        set({ isTyping: true });
      }
    });

    socket.on("stopTyping", (senderId) => {
      const { selectedUsers } = get();

      if (selectedUsers?._id === senderId) {
        set({ isTyping: false });
      }
    });

    socket.on("newMessage", (newMessage) => {
      const { selectedUsers } = get();

      const selectedUserId = selectedUsers?._id?.toString();
      const senderId =
        newMessage.senderId?._id?.toString?.() ||
        newMessage.senderId?.toString?.();
      const receiverId =
        newMessage.receiverId?._id?.toString?.() ||
        newMessage.receiverId?.toString?.();

      const isOpenConversation =
        selectedUserId &&
        (selectedUserId === senderId || selectedUserId === receiverId);

      if (isOpenConversation) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("typing");
    socket.off("stopTyping");
    socket.off("newMessage");
  },
  startTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUsers } = get();
    const authUser = useAuthStore.getState().authUser;

    if (!socket || !selectedUsers) return;

    socket.emit("typing", {
      receiverId: selectedUsers._id,
      senderId: authUser._id,
    });
  },

  stopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUsers } = get();
    const authUser = useAuthStore.getState().authUser;

    if (!socket || !selectedUsers) return;

    socket.emit("stopTyping", {
      receiverId: selectedUsers._id,
      senderId: authUser._id,
    });
  },
}));
