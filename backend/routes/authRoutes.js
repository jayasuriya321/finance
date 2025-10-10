// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// ===============================
// REGISTER USER
// ===============================
router.post("/register", registerUser);

// ===============================
// LOGIN USER
// ===============================
router.post("/login", loginUser);

// ===============================
// Optional: Add MFA, forgot-password later
// ===============================

export default router;
