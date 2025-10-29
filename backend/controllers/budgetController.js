// controllers/budgetController.js
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";

const ALERT_THRESHOLD_PERCENT = 80; // alert when usage reaches 80% of limit

// ===============================
// GET ALL BUDGETS WITH CURRENT USAGE
// ===============================
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const totalSpent = await Expense.aggregate([
          { $match: { user: req.user._id, category: budget.name } },
          { $group: { _id: null, sum: { $sum: "$amount" } } },
        ]);

        const spent = totalSpent[0]?.sum || 0;
        const remaining = Math.max(0, budget.limit - spent);
        const percentageUsed = Math.min(100, (spent / budget.limit) * 100);
        const alert = percentageUsed >= ALERT_THRESHOLD_PERCENT;

        return {
          ...budget.toObject(),
          spent,
          remaining,
          percentageUsed,
          alert,
        };
      })
    );

    res.json({ success: true, data: budgetsWithUsage });
  } catch (err) {
    console.error("getBudgets error:", err);
    res.status(500).json({ success: false, message: "Server error fetching budgets" });
  }
};

// ===============================
// ADD NEW BUDGET
// ===============================
export const addBudget = async (req, res) => {
  try {
    let { name, limit } = req.body;
    limit = Number(limit);

    if (!name || isNaN(limit)) {
      return res.status(400).json({
        success: false,
        message: "Name and valid numeric limit required",
      });
    }

    const existing = await Budget.findOne({ user: req.user._id, name });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Budget with this name already exists" });
    }

    const budget = await Budget.create({ name, limit, user: req.user._id });

    res.status(201).json({
      success: true,
      data: {
        ...budget.toObject(),
        spent: 0,
        remaining: limit,
        percentageUsed: 0,
        alert: false,
      },
    });
  } catch (err) {
    console.error("addBudget error:", err);
    res.status(500).json({ success: false, message: "Server error adding budget" });
  }
};

// ===============================
// UPDATE BUDGET
// ===============================
export const updateBudget = async (req, res) => {
  try {
    const { name, limit } = req.body;
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found" });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (name) budget.name = name;
    if (limit !== undefined) budget.limit = Number(limit);

    await budget.save();
    res.json({ success: true, message: "Budget updated", data: budget });
  } catch (err) {
    console.error("updateBudget error:", err);
    res.status(500).json({ success: false, message: "Server error updating budget" });
  }
};

// ===============================
// DELETE BUDGET
// ===============================
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget)
      return res.status(404).json({ success: false, message: "Budget not found" });

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await budget.deleteOne();
    res.json({ success: true, message: "Budget deleted" });
  } catch (err) {
    console.error("deleteBudget error:", err);
    res.status(500).json({ success: false, message: "Server error deleting budget" });
  }
};

// ===============================
// GET BUDGET SUMMARY FOR DASHBOARD
// ===============================
export const getBudgetSummary = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    const summary = await Promise.all(
      budgets.map(async (b) => {
        const totalSpent = await Expense.aggregate([
          { $match: { user: req.user._id, category: b.name } },
          { $group: { _id: null, sum: { $sum: "$amount" } } },
        ]);
        const spent = totalSpent[0]?.sum || 0;
        return {
          name: b.name,
          limit: b.limit,
          spent,
          remaining: Math.max(0, b.limit - spent),
          percentageUsed: Math.min(100, (spent / b.limit) * 100),
        };
      })
    );

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error("getBudgetSummary error:", err);
    res.status(500).json({ success: false, message: "Server error generating summary" });
  }
};

// ===============================
// 🔔 GET BUDGET ALERTS (new)
// ===============================
export const getBudgetAlerts = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    const alerts = [];

    for (const b of budgets) {
      const totalSpent = await Expense.aggregate([
        { $match: { user: req.user._id, category: b.name } },
        { $group: { _id: null, sum: { $sum: "$amount" } } },
      ]);

      const spent = totalSpent[0]?.sum || 0;
      const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;

      if (percent >= 100) {
        alerts.push({
          type: "danger",
          message: `⚠️ You exceeded your ${b.name} budget by ₹${(spent - b.limit).toLocaleString()}.`,
        });
      } else if (percent >= ALERT_THRESHOLD_PERCENT) {
        alerts.push({
          type: "warning",
          message: `⚠️ You’ve used ${percent.toFixed(1)}% of your ${b.name} budget.`,
        });
      }
    }

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (err) {
    console.error("getBudgetAlerts error:", err);
    res.status(500).json({
      success: false,
      message: "Server error generating budget alerts",
    });
  }
};
