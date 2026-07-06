import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { connect_db } from "./lib/db.connect.js";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import { ENV } from "../env.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// make ready for development

if (ENV.NODE_ENV === "production") {
  // Serve frontend assets
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Serve index.html for all non-API routes
  app.get("/{*splat}", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  connect_db();
});
