// routes/categoryRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory, // ✅ import update controller
} from "../controllers/categoryController.js";

const router = express.Router();

// Protect all category routes
router.use(protect);

// ===============================
// GET ALL CATEGORIES
// ===============================
router.get("/", getCategories);

// ===============================
// ADD NEW CATEGORY
// ===============================
router.post("/", addCategory);

// ===============================
// UPDATE CATEGORY
// ===============================
router.put("/:id", updateCategory); // ✅ add this

// ===============================
// DELETE A CATEGORY
// ===============================
router.delete("/:id", deleteCategory);

export default router;
