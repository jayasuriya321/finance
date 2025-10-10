// routes/dashboardRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { getSummary } from "../controllers/dashboardController.js";

const router = express.Router();

// Protect all dashboard routes
router.use(protect);

// ===============================
// GET DASHBOARD SUMMARY
// ===============================
router.get("/summary", getSummary);

export default router;
