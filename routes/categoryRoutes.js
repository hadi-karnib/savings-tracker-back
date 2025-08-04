import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.route("/").get(protect, getCategories).post(protect, createCategory);

router
  .route("/:id")
  .patch(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;
