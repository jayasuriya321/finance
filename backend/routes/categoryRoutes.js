// routes/categoryRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { getCategories, addCategory, deleteCategory } from "../controllers/categoryController.js";

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
// DELETE A CATEGORY
// ===============================
router.delete("/:id", deleteCategory);

export default router;
