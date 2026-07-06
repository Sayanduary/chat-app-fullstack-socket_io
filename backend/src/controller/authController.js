import bcrypt from "bcryptjs";
import { generateToken } from "../lib/util.js";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../emails/email.handler.js";
import { ENV } from "../../env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = await req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid Email" });
    }
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "Email already exist" });
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashPassword,
    });
    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          ENV.CLIEsNT_URL,
        );
      } catch (error) {
        console.log("failed to send welcome email", error);
      }
    } else {
      res.status(400).json({ message: "Invalid userdata" });
    }
  } catch (err) {
    console.error("Error in signup controller:", err);
    res.status(500).json({ message: "Internal Server Error" });
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
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "user logged out succesfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile Pic is required" });
    const userId = req.user._id;
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findById(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile", error);
    res.status(500).json({ message: "internal server error" });
  }
};
