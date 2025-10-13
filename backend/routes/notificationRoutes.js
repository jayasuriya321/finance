import express from "express";
import {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
