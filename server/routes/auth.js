import express from "express";
import {
  sendOtpController,
  verifyOtpController,
  registerController,
  loginController,
  logoutController,
  refreshTokenController,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/otp", sendOtpController); // Send OTP to contact number
router.post("/otp-verify/:contact", verifyOtpController); // Verify OTP for a contact number
router.post("/register", registerController); // Register a new user
router.post("/login", loginController); // Login user and issue tokens
router.post("/logout", logoutController); // Logout user and invalidate refresh token
router.get("/refresh-token", refreshTokenController); // Refresh access token using refresh token

export default router;
