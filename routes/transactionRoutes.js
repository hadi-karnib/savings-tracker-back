import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

router.route("/").get(protect, getTransactions).post(protect, addTransaction);

router
  .route("/:id")
  .patch(protect, updateTransaction)
  .delete(protect, deleteTransaction);

export default router;
