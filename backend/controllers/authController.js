// backend/controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Utility: Generate JWT
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

// ===============================
// REGISTER USER
// ===============================
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user),
      },
    });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// LOGIN USER
// ===============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
      data: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("❌ loginUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// Optional: Multi-Factor Auth / Role-based Access can be implemented here
// ===============================
