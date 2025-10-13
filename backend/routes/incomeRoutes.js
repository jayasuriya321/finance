import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Income from "../models/Income.js";

const router = express.Router();

// Get all incomes
router.get("/", protect, async (req, res) => {
  const incomes = await Income.find({ user: req.user.id });
  res.json(incomes);
});

// Add income
router.post("/", protect, async (req, res) => {
  const { source, amount } = req.body;
  const income = new Income({ user: req.user.id, source, amount });
  const saved = await income.save();
  res.status(201).json(saved);
});

// Delete income
router.delete("/:id", protect, async (req, res) => {
  const deleted = await Income.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Income not found" });
  res.json({ message: "Income deleted" });
});

export default router;
