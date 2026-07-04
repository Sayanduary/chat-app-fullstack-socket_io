import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import path from "path";

dotenv.config();
const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// make ready for development

if (process.env.NODE_ENV === "production") {
  // Serve frontend assets
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Serve index.html for all non-API routes
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
