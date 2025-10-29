// routes/forecastRoutes.js
import express from "express";
import { getForecast } from "../controllers/forecastController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/forecast
// @desc    Get next month's financial forecast
// @access  Private
router.get("/", protect, getForecast);

export default router;
