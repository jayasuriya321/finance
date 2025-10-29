// routes/budgetRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetAlerts, // ✅ new controller
} from "../controllers/budgetController.js";

const router = express.Router();

router.use(protect);

// ===============================
// GET ALL BUDGETS
// ===============================
router.get("/", getBudgets);

// ===============================
// ADD NEW BUDGET
// ===============================
router.post("/", addBudget);

// ===============================
// UPDATE BUDGET
// ===============================
router.put("/:id", updateBudget);

// ===============================
// DELETE BUDGET
// ===============================
router.delete("/:id", deleteBudget);

// ===============================
// 🔔 GET BUDGET ALERTS
// ===============================
router.get("/alerts", getBudgetAlerts);

// ===============================
// GET BUDGET SUMMARY
// ===============================
router.get("/summary/all", getBudgetSummary);

export default router;
