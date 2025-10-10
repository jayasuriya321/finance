// routes/expenseRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getExpenseReport,
} from "../controllers/expenseController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// ===============================
// GET ALL EXPENSES
// ===============================
router.get("/", getExpenses);

// ===============================
// ADD NEW EXPENSE
// ===============================
router.post("/", addExpense);

// ===============================
// DELETE EXPENSE
// ===============================
router.delete("/:id", deleteExpense);

// ===============================
// GET EXPENSE REPORT (totals by category & month)
// ===============================
router.get("/report", getExpenseReport);

export default router;
