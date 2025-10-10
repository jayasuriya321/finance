// backend/controllers/userController.js

import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Generate JWT Token
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ===============================
// REGISTER USER
// ===============================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: "User already exists" });

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// LOGIN USER
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Reset your password (valid 1 hour): <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ success: true, message: "Reset email sent" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ success: false, message: "Password required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    user.password = password; // hashed in pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// GET CURRENT USER PROFILE
// ===============================
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// UPDATE CURRENT USER PROFILE
// ===============================
export const updateMe = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // hashed in pre-save

    await user.save();

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
