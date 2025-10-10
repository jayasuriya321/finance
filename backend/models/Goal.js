// models/Goal.js
import mongoose from "mongoose";
import Expense from "./Expense.js";

const goalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    category: {
      type: String,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [0, "Target amount cannot be negative"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },
    deadline: {
      type: Date,
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
// Pre-save hook: update currentAmount based on expenses if category exists
// ===============================
goalSchema.pre("save", async function (next) {
  if (this.category) {
    const agg = await Expense.aggregate([
      { $match: { user: this.user, category: this.category } },
      { $group: { _id: null, sum: { $sum: "$amount" } } },
    ]);
    this.currentAmount = agg[0]?.sum || 0;
  }
  next();
});

export default mongoose.model("Goal", goalSchema);
