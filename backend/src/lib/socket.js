import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "../../env.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
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
});

export { app, server, io };
