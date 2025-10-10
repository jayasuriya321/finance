// routes/recurringRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getRecurringExpenses,
  addRecurringExpense,
  updateRecurringExpense,  // ✅ added
  deleteRecurringExpense,
} from "../controllers/recurringExpenseController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// ===============================
// GET ALL RECURRING EXPENSES
// ===============================
router.get("/", getRecurringExpenses);

// ===============================
// ADD NEW RECURRING EXPENSE
// ===============================
router.post("/", addRecurringExpense);

// ===============================
// UPDATE RECURRING EXPENSE
// ===============================
router.put("/:id", updateRecurringExpense); // ✅ added update route

// ===============================
// DELETE RECURRING EXPENSE
// ===============================
router.delete("/:id", deleteRecurringExpense);

export default router;
