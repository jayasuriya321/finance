// backend/controllers/dashboardController.js

import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import Category from "../models/Category.js";

// ===============================
// DASHBOARD SUMMARY
// ===============================
export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await Expense.find({ user: userId });
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // ===============================
    // Categories Summary
    // ===============================
    const categories = await Category.find({ user: userId });
    const categoryMap = {};
    categories.forEach((c) => (categoryMap[c.name] = c.name));

    const byCategory = {};
    expenses.forEach((e) => {
      const catName = categoryMap[e.category] || e.category || "Uncategorized";
      byCategory[catName] = (byCategory[catName] || 0) + Number(e.amount || 0);
    });

    // ===============================
    // Monthly Trend (Last 6 months + forecast next month)
    // ===============================
    const monthly = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = 0;
    }
    expenses.forEach((e) => {
      const d = new Date(e.date || e.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthly) monthly[key] += Number(e.amount || 0);
    });
    const monthlyTrend = Object.keys(monthly).map((k) => ({ month: k, expenses: monthly[k] }));

    // Forecast next month (simple average of last 6 months)
    const avgLast6 = monthlyTrend.reduce((sum, m) => sum + m.expenses, 0) / 6;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
    monthlyTrend.push({ month: nextMonthKey, expenses: Number(avgLast6.toFixed(2)), forecast: true });

    // ===============================
    // Budgets
    // ===============================
    const budgets = await Budget.find({ user: userId });
    const budgetSummary = budgets.map((b) => {
      const spent = expenses
        .filter((e) => e.category === b.name)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const progress = b.limit ? Math.min((spent / b.limit) * 100, 100) : 0;
      const alert = spent >= b.limit;

      return {
        id: b._id,
        name: b.name,
        limit: b.limit,
        spent,
        progress,
        alert,
      };
    });

    // ===============================
    // Goals
    // ===============================
    const goals = await Goal.find({ user: userId });
    const goalSummary = goals.map((g) => {
      const progress = g.targetAmount ? Math.min((g.currentAmount || 0) / g.targetAmount * 100, 100) : 0;
      const alert = g.currentAmount >= g.targetAmount;

      return {
        id: g._id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount || 0,
        category: g.category || null,
        deadline: g.deadline || null,
        progress,
        alert,
      };
    });

    res.json({
      success: true,
      data: {
        totalExpenses,
        byCategory,
        monthlyTrend,
        budgets: budgetSummary,
        goals: goalSummary,
      },
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ success: false, message: "Server error fetching dashboard summary" });
  }
};
