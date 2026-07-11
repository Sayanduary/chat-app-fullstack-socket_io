import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";
import { normalizeUrl } from "../lib/url";

const getSocketServerUrl = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:3000";
  }

  // Hardcode your fallback target domain directly instead of checking the UI origin
  const productionApiUrl =
    import.meta.env.VITE_API_URL || "https://ning-services.onrender.com/api";

  const base = normalizeUrl(
    productionApiUrl,
    "https://ning-services.onrender.com/api",
  );

  return base.replace(/\/api\/?$/, "");
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        validateStatus: (status) => status < 500,
      });

      if (res.status === 401) {
        set({ authUser: null });
        return;
      }

      set({
        authUser: res.data,
      });

      get().connectSocket();
    } catch (error) {
      console.log("error in auth-check", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({
        authUser: res.data,
      });

      get().connectSocket();
      toast.success("Account Created Successfully");
    } catch (error) {
      console.error(error.response);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logged In");
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something Went Wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      useChatStore.getState().resetChatState?.();

      set({
        authUser: null,
      });
      toast.success("Succesfully Logged Out");
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something Went Wrong");
    }
  },
  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile Updated Successfully");
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Something Went Wrong");
    }
  },
  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser || socket?.connected) return;

    const newSocket = io(getSocketServerUrl(), {
      query: {
        userId: authUser._id,
      },
      withCredentials: true,
    });

    newSocket.connect();

    newSocket.on("getOnlineUsers", (users) => {
      set({
        onlineUsers: users,
      });
    });

    set({
      socket: newSocket,
    });
  },

  disconnectSocket: () => {
    const { socket } = get();

    if (socket?.connected) {
      socket.disconnect();
    }

    set({
      socket: null,
      onlineUsers: [],
    });
  },
}));
