import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSpouseCode,
  linkSpouseByCode,
  unlinkSpouse,
  getSpouseCode,
} from "../controllers/userController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.post("/refresh-spouse-code", protect, refreshSpouseCode);
router.post("/link-spouse", protect, linkSpouseByCode);
router.post("/unlink-spouse", protect, unlinkSpouse);
router.get("/spouse-code", protect, getSpouseCode);

export default router;
