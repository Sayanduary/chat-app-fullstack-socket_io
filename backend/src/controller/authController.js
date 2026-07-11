import bcrypt from "bcryptjs";
import { ENV } from "../../env.js";
import { sendWelcomeEmail } from "../emails/email.handler.js";
import cloudinary from "../lib/cloudinary.configure.js";
import { generateToken } from "../lib/jwtToken.configure.js";
import User from "../models/User.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const savedUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // Generate JWT Cookie
    generateToken(savedUser._id, res);

    // Send welcome email (don't fail signup if email fails)
    try {
      await sendWelcomeEmail(
        savedUser.email,
        savedUser.fullName,
        savedUser.email,
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });
  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Intecloudrnal server error",
    });
  }
};

export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV !== "development",
    path: "/",
  });
  res.status(200).json({ message: "user logged out succesfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile Pic is required" });
    const userId = req.user._id;
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { returnDocument: "after" },
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile", error);
    res.status(500).json({ message: "internal server error" });
  }
};
