// controllers/forecastController.js
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

/**
 * Simple financial forecast based on average income/expense of the last 3 months
 */
export const getForecast = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user incomes & expenses
    const incomes = await Income.find({ user: userId });
    const expenses = await Expense.find({ user: userId });

    // Helper: Group data by month
    const groupByMonth = (records) => {
      const grouped = {};
      records.forEach((r) => {
        const month = new Date(r.date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        grouped[month] = (grouped[month] || 0) + Number(r.amount);
      });
      return grouped;
    };

    const incomeData = groupByMonth(incomes);
    const expenseData = groupByMonth(expenses);

    // Get last 3 months’ data
    const last3Income = Object.values(incomeData).slice(-3);
    const last3Expense = Object.values(expenseData).slice(-3);

    const avgIncome =
      last3Income.reduce((a, b) => a + b, 0) / (last3Income.length || 1);
    const avgExpense =
      last3Expense.reduce((a, b) => a + b, 0) / (last3Expense.length || 1);

    // Predict next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthLabel = nextMonth.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const forecast = {
      nextMonth: nextMonthLabel,
      predictedIncome: Math.round(avgIncome),
      predictedExpense: Math.round(avgExpense),
      predictedSavings: Math.round(avgIncome - avgExpense),
    };

    res.json({ success: true, forecast });
  } catch (err) {
    console.error("Forecast error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
