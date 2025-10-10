// backend/controllers/recurringExpenseController.js
import RecurringExpense from "../models/RecurringExpense.js";

// ===============================
// GET ALL RECURRING EXPENSES
// ===============================
export const getRecurringExpenses = async (req, res) => {
  try {
    const list = await RecurringExpense.find({ user: req.user._id }).sort({ startDate: -1 });

    const now = new Date();
    const data = list.map((r) => {
      // Determine the base date for nextRun calculation
      let nextRunDate = r.lastRun ? new Date(r.lastRun) : new Date(r.startDate);
      
      // Calculate next due date
      while (nextRunDate <= now) {
        switch (r.frequency) {
          case "daily":
            nextRunDate = new Date(nextRunDate.setDate(nextRunDate.getDate() + 1));
            break;
          case "weekly":
            nextRunDate = new Date(nextRunDate.setDate(nextRunDate.getDate() + 7));
            break;
          case "monthly":
            nextRunDate = new Date(nextRunDate.setMonth(nextRunDate.getMonth() + 1));
            break;
          case "yearly":
            nextRunDate = new Date(nextRunDate.setFullYear(nextRunDate.getFullYear() + 1));
            break;
          default:
            break;
        }
      }

      return {
        id: r._id,
        name: r.name,
        amount: r.amount,
        frequency: r.frequency,
        startDate: r.startDate,
        lastRun: r.lastRun,
        nextDueDate: nextRunDate,
        active: r.active !== undefined ? r.active : true,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("getRecurringExpenses error:", err);
    res.status(500).json({ success: false, message: "Server error fetching recurring expenses" });
  }
};

// ===============================
// ADD NEW RECURRING EXPENSE
// ===============================
export const addRecurringExpense = async (req, res) => {
  try {
    const { name, amount, frequency, startDate, active } = req.body;

    if (!name || !amount || !frequency) {
      return res.status(400).json({ success: false, message: "Name, amount, and frequency required" });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be positive" });
    }

    const validFrequencies = ["daily", "weekly", "monthly", "yearly"];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({ success: false, message: "Invalid frequency" });
    }

    const r = await RecurringExpense.create({
      name,
      amount,
      frequency,
      startDate: startDate || new Date(),
      active: active !== undefined ? active : true,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: r._id,
        name: r.name,
        amount: r.amount,
        frequency: r.frequency,
        startDate: r.startDate,
        lastRun: r.lastRun,
        nextDueDate: r.startDate,
        active: r.active,
      },
    });
  } catch (err) {
    console.error("addRecurringExpense error:", err);
    res.status(500).json({ success: false, message: "Server error adding recurring expense" });
  }
};

// ===============================
// UPDATE RECURRING EXPENSE
// ===============================
export const updateRecurringExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, frequency, startDate, active } = req.body;

    const r = await RecurringExpense.findById(id);
    if (!r) return res.status(404).json({ success: false, message: "Recurring expense not found" });

    if (r.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (name) r.name = name;
    if (amount && Number(amount) > 0) r.amount = amount;
    if (frequency) r.frequency = frequency;
    if (startDate) r.startDate = startDate;
    if (active !== undefined) r.active = active;

    await r.save();

    res.json({
      success: true,
      data: {
        id: r._id,
        name: r.name,
        amount: r.amount,
        frequency: r.frequency,
        startDate: r.startDate,
        lastRun: r.lastRun,
        nextDueDate: r.lastRun || r.startDate,
        active: r.active,
      },
    });
  } catch (err) {
    console.error("updateRecurringExpense error:", err);
    res.status(500).json({ success: false, message: "Server error updating recurring expense" });
  }
};

// ===============================
// DELETE RECURRING EXPENSE
// ===============================
export const deleteRecurringExpense = async (req, res) => {
  try {
    const r = await RecurringExpense.findById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Recurring expense not found" });

    if (r.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await r.deleteOne();
    res.json({ success: true, message: "Recurring expense deleted" });
  } catch (err) {
    console.error("deleteRecurringExpense error:", err);
    res.status(500).json({ success: false, message: "Server error deleting recurring expense" });
  }
};
