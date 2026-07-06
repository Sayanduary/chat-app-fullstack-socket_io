import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../../env.js";
export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized User" });
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Unauthorized Token" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User Not Found" });
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in Middleware", error);
    if (error === "JsonWebTokenError" || error === "TokenExpiredError") {
      return res.status(401).json({ message: "invalid or expired token" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};
