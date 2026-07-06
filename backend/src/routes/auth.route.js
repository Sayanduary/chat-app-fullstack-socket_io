import express from "express";
import { auth } from "../middleware/authentication.js";
import {
  login,
  logout,
  signup,
  updateProfile,
} from "../controller/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/update-profile", auth, updateProfile);

export default router;
