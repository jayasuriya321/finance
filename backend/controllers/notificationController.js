// controllers/notificationController.js
import Notification from "../models/Notification.js";

// ✅ Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message required" });
    }

    const notification = await Notification.create({
      user: req.user._id,
      message,
    });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    console.error("createNotification error:", err);
    res.status(500).json({ success: false, message: "Server error creating notification" });
  }
};

// ✅ Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: "Server error fetching notifications" });
  }
};

// ✅ Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.status(500).json({ success: false, message: "Server error updating notifications" });
  }
};

// ✅ Delete all notifications
export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    console.error("clearNotifications error:", err);
    res.status(500).json({ success: false, message: "Server error deleting notifications" });
  }
};
