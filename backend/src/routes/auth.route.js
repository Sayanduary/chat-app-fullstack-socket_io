import express from "express";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send("Sign Up Endpoint");
});

router.get("/api/auth/logout", (req, res) => {
  res.send("Logout Endpoint");
});

export default router;
