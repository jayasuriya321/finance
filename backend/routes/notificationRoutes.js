// routes/notificationRoutes.js
import express from "express";
import {
  createNotification,
  getNotifications,
  markAllAsRead,
  clearNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.use(protect);

router.get("/", getNotifications);
router.post("/", createNotification);
router.put("/mark-read", markAllAsRead);
router.delete("/", clearNotifications);

export default router;
