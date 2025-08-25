import express from "express";
import {
  sendOtpController,
  verifyOtpController,
  registerController,
  registerByAdminController,
  loginController,
  logoutController,
} from "../controllers/auth.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- Public Authentication Routes ---
router.post("/otp", sendOtpController);
router.post("/otp-verify/:contact", verifyOtpController);
router.post("/register", registerController);
router.post("/login", loginController);

// --- Protected Routes ---
router.post("/logout", authMiddleware, logoutController);
router.post("/register-by-admin", authMiddleware, isAdmin, registerByAdminController);

export default router;
//api/auth/otp
//api/auth/otp-verify/:contact
//api/auth/register
//api/auth/login
//api/auth/logout
//api/auth/register-by-admin