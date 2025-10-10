import Expense from "../models/Expense.js";
import Goal from "../models/Goal.js";

// ===============================
// GET ALL EXPENSES
// ===============================
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    console.error("getExpenses error:", err);
    res.status(500).json({ success: false, message: "Server error fetching expenses" });
  }
};

// ===============================
// ADD EXPENSE (Update Goal Progress)
// ===============================
export const addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ success: false, message: "Amount & category required" });
    }

    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description: description || "",
      date: date || Date.now(),
    });

    // Update related goal if exists (category match)
    const goal = await Goal.findOne({ user: req.user._id, category });
    if (goal) {
      goal.currentAmount += Number(amount);
      if (goal.currentAmount > goal.targetAmount) goal.currentAmount = goal.targetAmount;
      await goal.save();
    }

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error("addExpense error:", err);
    res.status(500).json({ success: false, message: "Server error adding expense" });
  }
};

// ===============================
// DELETE EXPENSE (Rollback Goal Progress)
// ===============================
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Rollback goal progress if applicable
    const goal = await Goal.findOne({ user: req.user._id, category: expense.category });
    if (goal) {
      goal.currentAmount = Math.max(0, goal.currentAmount - Number(expense.amount));
      await goal.save();
    }

    await expense.deleteOne();
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("deleteExpense error:", err);
    res.status(500).json({ success: false, message: "Server error deleting expense" });
  }
};

// ===============================
// EXPENSE REPORT: TOTALS BY CATEGORY & MONTH
// ===============================
export const getExpenseReport = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });

    const totalByCategory = {};
    const totalByMonth = {};

    expenses.forEach((e) => {
      // Totals by category
      totalByCategory[e.category] = (totalByCategory[e.category] || 0) + Number(e.amount || 0);

      // Totals by month
      const d = new Date(e.date || e.createdAt);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      totalByMonth[key] = (totalByMonth[key] || 0) + Number(e.amount || 0);
    });

    res.json({ success: true, data: { totalByCategory, totalByMonth } });
  } catch (err) {
    console.error("getExpenseReport error:", err);
    res.status(500).json({ success: false, message: "Server error generating report" });
  }
};

// ===============================
// OPTIONAL: Get expenses within a date range (dashboard filters)
// ===============================
export const getExpensesByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: new Date(start), $lte: new Date(end) },
    }).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    console.error("getExpensesByDateRange error:", err);
    res.status(500).json({ success: false, message: "Server error fetching expenses by date range" });
  }
};
