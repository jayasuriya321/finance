// routes/goalRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { getGoals, addGoal, deleteGoal } from "../controllers/goalController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// ===============================
// GET ALL GOALS (with current progress)
// ===============================
router.get("/", getGoals);

// ===============================
// ADD NEW GOAL
// ===============================
router.post("/", addGoal);

// ===============================
// DELETE GOAL
// ===============================
router.delete("/:id", deleteGoal);

export default router;
