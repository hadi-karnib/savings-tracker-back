// routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSpouseCode,
  linkSpouseByCode,
  unlinkSpouse,
  getSpouseCode,
  verifyEmailRequest,
  verifyEmailConfirm,
  getMe,
} from "../controllers/userController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Auth (strict verification)
router.post("/register", registerUser);
router.post("/verify-email/request", verifyEmailRequest); // resend code
router.post("/verify-email/confirm", verifyEmailConfirm); // confirm code -> logs in
router.post("/login", loginUser); // will 403 if not verified
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

// Spouse features
router.post("/refresh-spouse-code", protect, refreshSpouseCode);
router.post("/link-spouse", protect, linkSpouseByCode);
router.post("/unlink-spouse", protect, unlinkSpouse);
router.get("/spouse-code", protect, getSpouseCode);

export default router;
