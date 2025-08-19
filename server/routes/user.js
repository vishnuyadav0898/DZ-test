import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getCurrentUserController,
  getUserByIdController,
  updateUserStatusController,
  getAllUsersController,
} from "../controllers/user.js";

const router = express.Router();

router.get("/getallusers", getAllUsersController); // Get all users
router.get("/user/me", authMiddleware, getCurrentUserController); // Get currently logged-in user
router.get("/user/:id", getUserByIdController); // Get a user by ID
router.patch("/user/:id/status", updateUserStatusController); // Update a user's status

export default router;
