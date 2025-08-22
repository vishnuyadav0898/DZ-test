import express from "express";
import {sendOtpController,verifyOtpController,registerController,registerbyadmin,loginController,logoutController,} from "../controllers/auth.js";
import { authMiddleware, is_admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/otp", sendOtpController); // Send OTP to contact number
router.post("/otp-verify/:contact", verifyOtpController); // Verify OTP for a contact number
router.post("/register", registerController); // Register a new user
router.post("/register/admin", authMiddleware, is_admin, registerbyadmin); // Register a new user by admin
router.post("/login", loginController); // Login user and issue tokens
router.post("/logout", logoutController); // Logout user and invalidate refresh token

export default router;
