import express from "express";
import { auth } from "../middleware/authentication.middleware.js";

const router = express.Router();

const iceServers = [
  {
    urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
  },
];

router.get("/", auth, (req, res) => {
  res.json({ iceServers });
});

export default router;
