import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "../../env.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or local development hosts
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1") || origin === ENV.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

// userId -> Set<socketId>
const userSocketMap = {};

export function getReceiverSocketIds(userId) {
  return Array.from(userSocketMap[userId] || []);
}

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  const userId = socket.handshake.query.userId;
  socket.data.userId = userId;

  if (userId && userId !== "undefined") {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }

    userSocketMap[userId].add(socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);

    const disconnectUserId = socket.data.userId;

    if (disconnectUserId && disconnectUserId !== "undefined") {
      const socketIds = userSocketMap[disconnectUserId];

      if (socketIds) {
        socketIds.delete(socket.id);

        if (socketIds.size === 0) {
          delete userSocketMap[disconnectUserId];
        }
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
  socket.on("typing", ({ receiverId, senderId }) => {
    const receiverSocketIds = getReceiverSocketIds(receiverId);

    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((receiverSocketId) => {
        io.to(receiverSocketId).emit("typing", senderId);
      });
    }
  });

  socket.on("stopTyping", ({ receiverId, senderId }) => {
    const receiverSocketIds = getReceiverSocketIds(receiverId);

    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((receiverSocketId) => {
        io.to(receiverSocketId).emit("stopTyping", senderId);
      });
    }
  });

  // Video Call Signaling Events
  socket.on("video-call-offer", ({ targetId, offer, callerInfo }) => {
    const receiverSocketIds = getReceiverSocketIds(targetId);
    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("video-call-offer", {
          offer,
          callerInfo,
          senderSocketId: socket.id
        });
      });
    }
  });

  socket.on("video-call-accepted", ({ targetId, answer }) => {
    const receiverSocketIds = getReceiverSocketIds(targetId);
    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("video-call-accepted", { answer });
      });
    }
  });

  socket.on("video-call-declined", ({ targetId }) => {
    const receiverSocketIds = getReceiverSocketIds(targetId);
    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("video-call-declined");
      });
    }
  });

  socket.on("video-call-cancelled", ({ targetId }) => {
    const receiverSocketIds = getReceiverSocketIds(targetId);
    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("video-call-cancelled");
      });
    }
  });

  socket.on("ice-candidate", ({ targetId, candidate }) => {
    const receiverSocketIds = getReceiverSocketIds(targetId);
    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("ice-candidate", { candidate });
      });
    }
  });

  socket.on("end-video-call", ({ targetId }) => {
    const receiverSocketIds = getReceiverSocketIds(targetId);
    if (receiverSocketIds.length) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("end-video-call");
      });
    }
  });
});

export { app, server, io };
