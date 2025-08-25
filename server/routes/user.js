import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getCurrentUserController,
  getUserByIdController,
  updateUserStatusController,
  getAllUsersController,
} from "../controllers/user.js";

const router = express.Router();

// Route to get the currently logged-in user's profile
router.get("/me", authMiddleware, getCurrentUserController);

// Admin-only route to get all users
router.get("/", authMiddleware, isAdmin, getAllUsersController);

// Routes for a specific user, some actions may be admin-only
router.get("/:id",authMiddleware, getUserByIdController) // Allow users to view other profiles
router.patch("/:id",authMiddleware, updateUserStatusController); // Only admins can change status

export default router;
