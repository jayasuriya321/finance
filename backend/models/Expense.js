// models/Expense.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      default: "",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ===============================
// Optional: Pre-save hook for validation or category standardization
// ===============================
expenseSchema.pre("save", function (next) {
  if (!this.title) {
    this.title = this.category; // fallback if title not provided
  }
  next();
});

export default mongoose.model("Expense", expenseSchema);
