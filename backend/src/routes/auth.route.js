import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
} from "../controller/authController.js";
import { auth } from "../middleware/authentication.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/update-profile", auth, updateProfile);
router.get("/check", auth, (req, res) => {
  res.status(200).json(req.user);

});

export default router;
