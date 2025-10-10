// models/RecurringExpense.js
import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Expense name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"], // ✅ yearly included
      required: [true, "Frequency is required"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    lastRun: {
      type: Date,
      default: null, // track the last time this recurring expense was applied
    },
    active: {
      type: Boolean,
      default: true, // allows enabling/disabling recurring expenses
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
// Pre-save hook to ensure lastRun >= startDate
// ===============================
recurringSchema.pre("save", function (next) {
  if (this.lastRun && this.lastRun < this.startDate) {
    this.lastRun = this.startDate;
  }
  next();
});

export default mongoose.model("RecurringExpense", recurringSchema);
