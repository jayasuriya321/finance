import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

// Forecast future savings
export const getForecast = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ user: userId });
    const incomes = await Income.find({ user: userId });

    const totalIncome = incomes.reduce((a, b) => a + b.amount, 0);
    const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
    const savings = totalIncome - totalExpense;

    // Simple projection for next month (example)
    const projectedExpenses = totalExpense * 1.05; // +5% growth
    const projectedSavings = totalIncome - projectedExpenses;

    res.json({
      totalIncome,
      totalExpense,
      savings,
      projectedExpenses,
      projectedSavings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
