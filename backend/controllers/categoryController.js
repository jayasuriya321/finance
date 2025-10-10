import Category from "../models/Category.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

// ===============================
// GET USER CATEGORIES
// ===============================
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ success: false, message: "Server error fetching categories" });
  }
};

// ===============================
// ADD NEW CATEGORY
// ===============================
export const addCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name required" });
    }

    const exists = await Category.findOne({ name, user: req.user._id });
    if (exists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      icon: icon || "📁",
      color: color || "#4f46e5", // default Tailwind indigo
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("addCategory error:", err);
    res.status(500).json({ success: false, message: "Server error adding category" });
  }
};

// ===============================
// UPDATE CATEGORY
// ===============================
export const updateCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.json({ success: true, message: "Category updated", data: category });
  } catch (err) {
    console.error("updateCategory error:", err);
    res.status(500).json({ success: false, message: "Server error updating category" });
  }
};

// ===============================
// DELETE CATEGORY (and related data if required)
// ===============================
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Optional: cascade delete related expenses & budgets
    await Expense.deleteMany({ user: req.user._id, category: category.name });
    await Budget.deleteMany({ user: req.user._id, name: category.name });

    await category.deleteOne();

    res.json({
      success: true,
      message: "Category and related expenses/budgets deleted",
    });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ success: false, message: "Server error deleting category" });
  }
};

// ===============================
// GET CATEGORY SUMMARY (for charts)
// ===============================
export const getCategorySummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error("getCategorySummary error:", err);
    res.status(500).json({ success: false, message: "Server error generating summary" });
  }
};
