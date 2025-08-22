// routes/permissionRoutes.js
import express from "express";
import {fetchPermissions,addPermission,givePermissionsToRole,revokePermissionFromRole,fetchRolePermissions,} from "../controllers/rolePermissionController.js";

const router = express.Router();

router.get("/allpermission", fetchPermissions); // Get all permissions
router.post("/addpermission", addPermission); // Add a new permission
router.post("/assign", givePermissionsToRole); // Assign permissions to role
router.post("/revoke", revokePermissionFromRole); // Revoke permission from role
router.get("/role/:roleId", fetchRolePermissions); // Get role's permissions

export default router;
