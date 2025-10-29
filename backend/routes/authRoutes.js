// backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  verifyMfaOtp,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// ===============================
// REGISTER & LOGIN
// ===============================
router.post("/register", registerUser);
router.post("/login", loginUser);

// ===============================
// MFA OTP VERIFY
// ===============================
router.post("/mfa/verify", verifyMfaOtp);

// ===============================
// EMAIL VERIFICATION
// ===============================
router.post("/email/verify", verifyEmailOtp);
router.post("/email/resend", resendEmailOtp);

// ===============================
// PASSWORD RESET
// ===============================
router.post("/password/forgot", forgotPassword);
router.post("/password/reset/:token", resetPassword);

export default router;
