// controllers/permissionController.js
import * as Permission from '../models/Permission.js';

export async function fetchPermissions(req, res) {
  try {
    const permissions = await Permission.getPermissions();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addPermission(req, res) {
  try {
    const { name } = req.body;
    const result = await Permission. createPermission(name);
    res.status(201).json(result[0] || { message: "Permission already exists" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function givePermissionsToRole(req, res) {
  try {
    const { roleId, permissionIds } = req.body;
    await  Permission.assignPermissionsToRole(roleId, permissionIds);
    res.json({ message: "Permissions assigned successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function  revokePermissionFromRole(req, res) {
  try {
    const { roleId, permissionId } = req.body;
    await Permission.removePermissionFromRole(roleId, permissionId);
    res.json({ message: "Permission revoked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function fetchRolePermissions(req, res) {
  try {
    const { roleId } = req.params;
    const result = await Permission.getRolePermissions(roleId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
