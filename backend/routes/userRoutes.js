// routes/userRoutes.js
import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  getPreferences,
  updatePreferences,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// AUTH
router.post("/register", register);
router.post("/login", login);

// PASSWORD RESET
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// PROFILE
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

// PREFERENCES
router.get("/preferences", protect, getPreferences);
router.patch("/preferences", protect, updatePreferences);

export default router;
