import express from "express";
import { protect } from "../middleware/auth.js";
import { getGoals, addGoal, deleteGoal, updateGoal } from "../controllers/goalController.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// GET ALL GOALS
router.get("/", getGoals);

// ADD NEW GOAL
router.post("/", addGoal);

// UPDATE GOAL
router.put("/:id", updateGoal);

// DELETE GOAL
router.delete("/:id", deleteGoal);

export default router;
