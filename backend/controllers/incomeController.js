import Income from "../models/Income.js";
import mongoose from "mongoose";

// ===============================
// GET ALL INCOMES
// ===============================
export const getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, data: incomes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// ADD INCOME
// ===============================
export const addIncome = async (req, res) => {
  try {
    const { amount, source, date } = req.body;
    const income = await Income.create({ user: req.user._id, amount, source, date });
    res.status(201).json({ success: true, data: income });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ===============================
// UPDATE INCOME  ✅ (NEW)
// ===============================
export const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income)
      return res.status(404).json({ success: false, message: "Income not found" });

    if (income.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const { amount, source, date } = req.body;

    // Update only provided fields
    if (amount !== undefined) income.amount = amount;
    if (source !== undefined) income.source = source;
    if (date !== undefined) income.date = date;

    const updatedIncome = await income.save();
    res.json({ success: true, data: updatedIncome });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// DELETE INCOME
// ===============================
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ success: false, message: "Income not found" });
    if (income.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Unauthorized" });

    await income.deleteOne();
    res.json({ success: true, message: "Income deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET WEEKLY / MONTHLY AGGREGATED INCOME
// ===============================
export const getIncomeReport = async (req, res) => {
  try {
    const { period } = req.query; // period=weekly | monthly

    let groupFormat;
    if (period === "weekly") groupFormat = { $week: "$date" };
    else if (period === "monthly") groupFormat = { $month: "$date" };
    else
      return res.status(400).json({ success: false, message: "Invalid period" });

    const report = await Income.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: groupFormat,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
