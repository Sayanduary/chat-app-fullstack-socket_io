import express from "express";
import { signup } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);

router.get("/api/auth/logout", (req, res) => {
  res.send("Logout Endpoint");
});

export default router;
