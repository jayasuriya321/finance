import { sendMail } from "../utlis/sendMail.js";
import { exportCSV } from "../utlis/exportCSV.js";
import { exportPDF } from "../utlis/exportPDF.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";
import RecurringExpense from "../models/RecurringExpense.js";

// ===============================
// SEND EXPENSE REPORT VIA EMAIL (CSV + PDF)
// ===============================
export const sendExpenseReportEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    // CSV generation
    const csvData = exportCSV(expenses, ["title", "amount", "category", "date"]);

    // PDF generation
    const pdfDocDefinition = {
      content: [
        { text: "Expense Report", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*"],
            body: [
              ["Title", "Amount", "Category", "Date"],
              ...expenses.map((e) => [
                e.title || e.description || "",
                e.amount,
                e.category || "",
                new Date(e.date).toISOString().split("T")[0],
              ]),
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      },
    };

    await sendMail({
      to: req.user.email,
      subject: "Your Expense Report",
      text: "Attached is your expense report.",
      html: "<p>Please find your expense report attached.</p>",
      attachments: [
        { filename: "expense-report.csv", content: csvData },
        { filename: "expense-report.pdf", content: await exportPDF(pdfDocDefinition) },
      ],
    });

    res.json({ success: true, message: "Expense report sent successfully" });
  } catch (error) {
    console.error("sendExpenseReportEmail error:", error);
    res.status(500).json({ success: false, message: "Failed to send report" });
  }
};

// ===============================
// EXPENSE REPORT (Summary for Dashboard) with filters
// ===============================
export const getExpenseReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, goal, startDate, endDate } = req.query;

    const query = { user: userId };
    if (category) query.category = category;
    if (goal) query.goal = goal; // assuming Expense has a goal field
    if (startDate || endDate) query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);

    const expenses = await Expense.find(query);

    const totalByCategory = {};
    const totalByMonth = {};

    expenses.forEach((e) => {
      totalByCategory[e.category] = (totalByCategory[e.category] || 0) + Number(e.amount || 0);
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
// BUDGET REPORT (Spent vs Limit)
// ===============================
export const getBudgetReport = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    const budgetReport = await Promise.all(
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
          alert: spent >= b.limit,
        };
      })
    );

    res.json({ success: true, data: budgetReport });
  } catch (err) {
    console.error("getBudgetReport error:", err);
    res.status(500).json({ success: false, message: "Server error generating budget report" });
  }
};

// ===============================
// GOAL REPORT (Progress)
// ===============================
export const getGoalReport = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const goalReport = goals.map((g) => ({
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount || 0,
      progress: g.targetAmount ? ((g.currentAmount || 0) / g.targetAmount) * 100 : 0,
      category: g.category || "",
      deadline: g.deadline || null,
      alert: g.currentAmount >= g.targetAmount,
    }));

    res.json({ success: true, data: goalReport });
  } catch (err) {
    console.error("getGoalReport error:", err);
    res.status(500).json({ success: false, message: "Server error generating goal report" });
  }
};

// ===============================
// DOWNLOAD EXPENSE REPORT (CSV or PDF)
// ===============================
export const downloadExpenseReport = async (req, res) => {
  try {
    const { format = "csv" } = req.query; // csv or pdf
    const userId = req.user._id;
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    if (format === "pdf") {
      const pdfDocDefinition = {
        content: [
          { text: "Expense Report", style: "header" },
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "*", "*"],
              body: [
                ["Title", "Amount", "Category", "Date"],
                ...expenses.map((e) => [
                  e.title || e.description || "",
                  e.amount,
                  e.category || "",
                  new Date(e.date).toISOString().split("T")[0],
                ]),
              ],
            },
          },
        ],
        styles: { header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] } },
      };
      const pdfBuffer = await exportPDF(pdfDocDefinition);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="expense-report.pdf"`);
      return res.send(pdfBuffer);
    }

    // default CSV
    const csvData = exportCSV(expenses, ["title", "amount", "category", "date"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="expense-report.csv"`);
    res.send(csvData);
  } catch (error) {
    console.error("downloadExpenseReport error:", error);
    res.status(500).json({ success: false, message: "Failed to download report" });
  }
};

// ===============================
// DOWNLOAD BUDGET REPORT (CSV or PDF)
// ===============================
export const downloadBudgetReport = async (req, res) => {
  try {
    const { format = "csv" } = req.query;
    const budgets = await Budget.find({ user: req.user._id });

    const report = await Promise.all(
      budgets.map(async (b) => {
        const totalSpent = await Expense.aggregate([
          { $match: { user: req.user._id, category: b.name } },
          { $group: { _id: null, sum: { $sum: "$amount" } } },
        ]);
        const spent = totalSpent[0]?.sum || 0;
        return { name: b.name, limit: b.limit, spent, remaining: Math.max(0, b.limit - spent) };
      })
    );

    if (format === "pdf") {
      const pdfDocDefinition = {
        content: [
          { text: "Budget Report", style: "header" },
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "*", "*"],
              body: [
                ["Budget", "Limit", "Spent", "Remaining"],
                ...report.map((r) => [r.name, r.limit, r.spent, r.remaining]),
              ],
            },
          },
        ],
        styles: { header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] } },
      };
      const pdfBuffer = await exportPDF(pdfDocDefinition);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="budget-report.pdf"`);
      return res.send(pdfBuffer);
    }

    // default CSV
    const csvData = exportCSV(report, ["name", "limit", "spent", "remaining"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="budget-report.csv"`);
    res.send(csvData);
  } catch (error) {
    console.error("downloadBudgetReport error:", error);
    res.status(500).json({ success: false, message: "Failed to download budget report" });
  }
};
