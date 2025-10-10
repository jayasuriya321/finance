// routes/userRoutes.js
import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ===============================
// AUTH ROUTES
// ===============================
router.post("/register", register);          // User registration
router.post("/login", login);                // User login

// ===============================
// PASSWORD RESET
// ===============================
router.post("/forgot-password", forgotPassword);           // Request reset email
router.post("/reset-password/:token", resetPassword);     // Reset password with token

// ===============================
// PROFILE (PROTECTED)
// ===============================
router.get("/me", protect, getMe);          // Get current user profile
router.put("/me", protect, updateMe);       // Update current user profile

export default router;
