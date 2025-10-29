import express from "express";
import {
  getIncomes,
  addIncome,
  deleteIncome,
  getIncomeReport,
  updateIncome, // ✅ import this
} from "../controllers/incomeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// CRUD
router.get("/", protect, getIncomes);
router.post("/", protect, addIncome);
router.put("/:id", protect, updateIncome); // ✅ added this for editing income
router.delete("/:id", protect, deleteIncome);

// Aggregated Reports
router.get("/report", protect, getIncomeReport);

export default router;
