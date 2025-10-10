// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
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
// Pre-save hook: Ensure unique category per user
// ===============================
categorySchema.pre("save", async function (next) {
  const existing = await mongoose.models.Category.findOne({
    name: this.name,
    user: this.user,
  });
  if (existing && existing._id.toString() !== this._id.toString()) {
    return next(new Error("Category already exists for this user"));
  }
  next();
});

export default mongoose.model("Category", categorySchema);
