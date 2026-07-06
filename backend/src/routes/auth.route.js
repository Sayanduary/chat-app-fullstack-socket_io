import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
} from "../controller/authController.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { auth } from "../middleware/authentication.middleware.js";

const router = express.Router();

router.get("/test", arcjetProtection, (req, res) => {
  res.status(200).json({message:"Arcjet Passed"})
})
router.post("/signup", signup);
router.post("/login",arcjetProtection, login);
router.post("/logout", logout);
router.post("/update-profile", auth, updateProfile);
router.get("/check", auth, (req, res) => {
  res.status(200).json(req.user);

});

export default router;
