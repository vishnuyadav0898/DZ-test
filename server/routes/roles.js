import express from "express";

const router = express.Router();

import {createRoleController,getAllRolesController,} from "../controllers/role.js";

router.post("/roles", createRoleController); // Create a new role
router.get("/getallroles", getAllRolesController); // Get all roles

export default router;
