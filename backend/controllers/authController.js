// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendMail } from "../utlis/sendMail.js";

dotenv.config();

// ===============================
// Helper: Generate JWT token
// ===============================
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

// ===============================
// REGISTER USER
// ===============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const user = await User.create({ name, email, password });

    // Generate Email OTP via model method
    const otp = user.getEmailVerificationToken();
    await user.save();

    await sendMail({
      to: email,
      subject: "Verify your email",
      html: `<p>Your verification OTP is <strong>${otp}</strong></p>`,
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email.",
      data: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("registerUser error:", error);
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
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // MFA Check
    if (user.mfaEnabled) {
      const otp = user.generateMfaToken();
      await user.save();

      await sendMail({
        to: email,
        subject: "Your Login OTP",
        html: `<p>Your login OTP is <strong>${otp}</strong></p>`,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email for MFA verification",
        mfaRequired: true,
        email: user.email,
      });
    }

    // Normal Login
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// VERIFY MFA OTP
// ===============================
export const verifyMfaOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email & OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const validOtp = user.verifyMfaToken(otp);
    if (!validOtp)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    // Clear MFA
    user.mfaToken = undefined;
    user.mfaExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "MFA verification successful",
      token: generateToken(user),
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("verifyMfaOtp error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// VERIFY EMAIL OTP
// ===============================
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email & OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const validOtp = user.verifyEmailToken(otp);
    if (!validOtp)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("verifyEmailOtp error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// RESEND EMAIL OTP
// ===============================
export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });
    if (user.emailVerified)
      return res.status(400).json({ success: false, message: "Email already verified" });

    const otp = user.getEmailVerificationToken();
    await user.save();

    await sendMail({
      to: email,
      subject: "Resend Email Verification OTP",
      html: `<p>Your new OTP code is <strong>${otp}</strong></p>`,
    });

    res.status(200).json({
      success: true,
      message: "OTP resent successfully to your email",
    });
  } catch (error) {
    console.error("resendEmailOtp error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// FORGOT PASSWORD (Send Reset Link)
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Please click the link below:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
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

    if (!token || !password)
      return res.status(400).json({ success: false, message: "Token and password required" });

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful, please log in",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
