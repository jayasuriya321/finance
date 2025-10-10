// routes/budgetRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} from "../controllers/budgetController.js";

const router = express.Router();

// Protect all budget routes
router.use(protect);

// ===============================
// GET ALL BUDGETS (with usage & alerts)
// ===============================
router.get("/", getBudgets);

// ===============================
// ADD NEW BUDGET
// ===============================
router.post("/", addBudget);

// ===============================
// UPDATE A BUDGET (name or limit)
// ===============================
router.put("/:id", updateBudget);

// ===============================
// DELETE A BUDGET
// ===============================
router.delete("/:id", deleteBudget);

// ===============================
// GET BUDGET SUMMARY (for dashboard charts)
// ===============================
router.get("/summary/all", getBudgetSummary);

export default router;
