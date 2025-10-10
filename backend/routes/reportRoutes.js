import express from "express";
import { protect } from "../middleware/auth.js";
import {
  sendExpenseReportEmail,
  getExpenseReport,
  getBudgetReport,
  getGoalReport, // new
} from "../controllers/reportController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// ===============================
// SEND EXPENSE REPORT VIA EMAIL
// ===============================
router.get("/expenses/email", sendExpenseReportEmail);

// ===============================
// GET EXPENSE REPORT FOR DASHBOARD
// Supports optional query filters: category, goal, startDate, endDate
// ===============================
router.get("/expenses", getExpenseReport);

// ===============================
// GET BUDGET REPORT
// ===============================
router.get("/budgets", getBudgetReport);

// ===============================
// GET GOAL REPORT (Progress & Alerts)
// ===============================
router.get("/goals", getGoalReport);

export default router;
