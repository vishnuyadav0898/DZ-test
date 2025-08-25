import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllPermissionsController,
  createPermissionController,
  assignPermissionsToRoleController,
  revokePermissionFromRoleController,
  getRolePermissionsController,
} from "../controllers/rolePermissionController.js";

const router = express.Router();

// --- Manage Permissions (Admin Only) ---
router.get("/", getAllPermissionsController)
 router.post("/",authMiddleware, createPermissionController);

// --- Manage Role-Permission Assignments (Admin Only) ---
router.post("/assign-to-role", authMiddleware, isAdmin, assignPermissionsToRoleController);
router.post("/revoke-from-role", authMiddleware, isAdmin, revokePermissionFromRoleController);

// --- View Permissions for a Specific Role ---
router.get("/role/:roleId", authMiddleware, getRolePermissionsController);

export default router;
