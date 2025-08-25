import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import RolePermission from "../models/RolePermission.js"; // Assuming this join table model exists

// -------------------- Create Permission --------------------
export const createPermissionController = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Permission name is required." });
  }

  try {
    // findOrCreate prevents duplicates and returns the instance
    const [permission, created] = await Permission.findOrCreate({
      where: { name },
      defaults: { name },
    });

    if (!created) {
      return res.status(409).json({ message: "Permission already exists." });
    }

    return res
      .status(201)
      .json({ message: "Permission created successfully", data: permission });
  } catch (err) {
    console.error("Create Permission Error:", err);
    return res
      .status(500)
      .json({ message: "Error creating permission", error: err.message });
  }
};

// -------------------- Get All Permissions --------------------
export const getAllPermissionsController = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    return res.status(200).json({ data: permissions });
  } catch (err) {
    console.error("Fetch Permissions Error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching permissions", error: err.message });
  }
};

// -------------------- Assign Permissions to a Role --------------------
export const assignPermissionsToRoleController = async (req, res) => {
  const { roleId, permissionIds } = req.body;

  if (!roleId || !permissionIds || !Array.isArray(permissionIds)) {
    return res
      .status(400)
      .json({ message: "roleId and an array of permissionIds are required." });
  }

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    // Sequelize's mixin method to add associations
    await role.addPermissions(permissionIds);

    return res.status(200).json({ message: "Permissions assigned successfully." });
  } catch (err) {
    console.error("Assign Permissions Error:", err);
    return res
      .status(500)
      .json({ message: "Error assigning permissions", error: err.message });
  }
};

// -------------------- Revoke a Permission from a Role --------------------
export const revokePermissionFromRoleController = async (req, res) => {
  const { roleId, permissionId } = req.body;

  if (!roleId || !permissionId) {
    return res
      .status(400)
      .json({ message: "roleId and permissionId are required." });
  }

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    // Sequelize's mixin method to remove a specific association
    await role.removePermission(permissionId);

    return res.status(200).json({ message: "Permission revoked successfully." });
  } catch (err) {
    console.error("Revoke Permission Error:", err);
    return res
      .status(500)
      .json({ message: "Error revoking permission", error: err.message });
  }
};

// -------------------- Get All Permissions for a Role --------------------
export const getRolePermissionsController = async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await Role.findByPk(roleId, {
      // Eager load the associated permissions
      include: [
        {
          model: Permission,
          through: { attributes: [] }, // Exclude join table attributes
        },
      ],
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    return res.status(200).json({ data: role.Permissions });
  } catch (err) {
    console.error("Fetch Role Permissions Error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching role permissions", error: err.message });
  }
};
