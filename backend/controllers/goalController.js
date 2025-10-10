import Goal from "../models/Goal.js";
import Expense from "../models/Expense.js";

// ===============================
// GET ALL GOALS (with dynamic progress recalculation)
// ===============================
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Dynamically compute progress for each goal if category is set
    const updatedGoals = await Promise.all(
      goals.map(async (g) => {
        if (g.category) {
          const agg = await Expense.aggregate([
            { $match: { user: req.user._id, category: g.category } },
            { $group: { _id: null, sum: { $sum: "$amount" } } },
          ]);
          g.currentAmount = agg[0]?.sum || 0;
          await g.save();
        }
        return g;
      })
    );

    res.json({ success: true, data: updatedGoals });
  } catch (err) {
    console.error("getGoals error:", err);
    res.status(500).json({ success: false, message: "Server error fetching goals" });
  }
};

// ===============================
// ADD NEW GOAL
// ===============================
export const addGoal = async (req, res) => {
  try {
    const { title, category, targetAmount, deadline, description, color } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Goal title and target amount are required",
      });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title: title.trim(),
      category: category || null,
      targetAmount: Number(targetAmount),
      deadline: deadline || null,
      description: description || "",
      color: color || "#22c55e", // Default Tailwind green-500
      currentAmount: 0,
    });

    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    console.error("addGoal error:", err);
    res.status(500).json({ success: false, message: "Server error adding goal" });
  }
};

// ===============================
// UPDATE GOAL
// ===============================
export const updateGoal = async (req, res) => {
  try {
    const { title, category, targetAmount, deadline, description, color } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (title) goal.title = title.trim();
    if (category !== undefined) goal.category = category;
    if (targetAmount) goal.targetAmount = Number(targetAmount);
    if (deadline) goal.deadline = deadline;
    if (description) goal.description = description;
    if (color) goal.color = color;

    await goal.save();
    res.json({ success: true, message: "Goal updated successfully", data: goal });
  } catch (err) {
    console.error("updateGoal error:", err);
    res.status(500).json({ success: false, message: "Server error updating goal" });
  }
};

// ===============================
// DELETE GOAL
// ===============================
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await goal.deleteOne();
    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (err) {
    console.error("deleteGoal error:", err);
    res.status(500).json({ success: false, message: "Server error deleting goal" });
  }
};

// ===============================
// GET GOAL PROGRESS SUMMARY (for dashboard charts)
// ===============================
export const getGoalProgress = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const progress = goals.map((g) => {
      const percentage = g.targetAmount
        ? Math.min(100, ((g.currentAmount || 0) / g.targetAmount) * 100)
        : 0;

      // Days remaining if deadline exists
      let daysLeft = null;
      if (g.deadline) {
        const diff = new Date(g.deadline) - new Date();
        daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }

      return {
        id: g._id,
        title: g.title,
        category: g.category || "Uncategorized",
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount || 0,
        percentage,
        deadline: g.deadline || null,
        daysLeft,
        color: g.color,
      };
    });

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error("getGoalProgress error:", err);
    res.status(500).json({ success: false, message: "Server error fetching goal progress" });
  }
};
