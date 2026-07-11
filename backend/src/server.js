import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { ENV } from "../env.js";
import { connect_db } from "./lib/db.configure.js";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
dotenv.config();

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});
// make ready for development

connect_db()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });
