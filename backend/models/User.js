import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // ===============================
    // Password Reset
    // ===============================
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // ===============================
    // Email Verification
    // ===============================
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    emailVerified: { type: Boolean, default: false },

    // ===============================
    // Multi-factor Authentication (MFA)
    // ===============================
    mfaEnabled: { type: Boolean, default: false }, // Enable/disable MFA
    mfaToken: String,                               // OTP token
    mfaExpires: Date,                               // OTP expiration

    // ===============================
    // User Preferences
    // ===============================
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      currency: { type: String, default: "INR" },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

// ===============================
// Hash password before save
// ===============================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ===============================
// Match entered password
// ===============================
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// ===============================
// Generate Password Reset Token
// ===============================
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 3600 * 1000; // 1 hour
  return resetToken;
};

// ===============================
// Generate Email Verification Token
// ===============================
userSchema.methods.getEmailVerificationToken = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.emailVerificationToken = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return otp; // Return plain OTP to send via email
};

// ===============================
// Verify Email OTP
// ===============================
userSchema.methods.verifyEmailToken = function (enteredOtp) {
  const hashedOtp = crypto.createHash("sha256").update(enteredOtp).digest("hex");
  return (
    this.emailVerificationToken === hashedOtp &&
    this.emailVerificationExpires &&
    this.emailVerificationExpires > Date.now()
  );
};

// ===============================
// Generate MFA OTP
// ===============================
userSchema.methods.generateMfaToken = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.mfaToken = crypto.createHash("sha256").update(otp).digest("hex");
  this.mfaExpires = Date.now() + 5 * 60 * 1000; // 5 min
  return otp; // Return plain OTP to send via email
};

// ===============================
// Verify MFA OTP
// ===============================
userSchema.methods.verifyMfaToken = function (enteredOtp) {
  const hashedOtp = crypto.createHash("sha256").update(enteredOtp).digest("hex");
  return this.mfaToken === hashedOtp && this.mfaExpires && this.mfaExpires > Date.now();
};

export default mongoose.model("User", userSchema);
