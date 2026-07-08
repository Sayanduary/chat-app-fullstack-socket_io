import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from "../controller/messageController.js";
import { auth } from "../middleware/authentication.middleware.js";

const router = express.Router();

router.use(auth);
router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

// 6a4bccd8af30684ce6837104

export default router;
