import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleController,
  deleteRoleController,
} from "../controllers/role.js"; 

const router = express.Router();


// GET /api/roles/getall - Fetches all roles
router.get("/getall", getAllRolesController);

// POST /api/roles/create - Creates a new role
router.post("/create", createRoleController);

// GET /api/roles/:id - Fetches a single role by its ID
router.get("/:id",getRoleByIdController);

// PUT /api/roles/:id - Updates a role by its ID
router.put("/:id", authMiddleware, isAdmin, updateRoleController);

// DELETE /api/roles/:id - Deletes a role by its ID
router.delete("/:id", authMiddleware, isAdmin, deleteRoleController);


export default router;
