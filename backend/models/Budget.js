// models/Budget.js
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Budget name is required"],
      trim: true,
      maxlength: [50, "Budget name cannot exceed 50 characters"],
    },
    limit: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [0, "Budget limit cannot be negative"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===============================
// Removed async virtuals — not supported by Mongoose
// Spent & remaining are calculated in controller
// ===============================

// ===============================
// Validation Hook
// ===============================
budgetSchema.pre("save", function (next) {
  if (this.limit < 0) {
    return next(new Error("Budget limit cannot be negative"));
  }
  next();
});

export default mongoose.model("Budget", budgetSchema);
