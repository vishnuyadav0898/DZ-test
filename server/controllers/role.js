import {createRole,getRoles} from '../models/Role.js';

// Controller to handle creating a new role
export const createRoleController = async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  try {
    const newRole = await createRole(role);
    res.status(201).json({ message: "Role created", data: newRole });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ message: "Role already exists" });
    }
    res.status(500).json({ message: "Error creating role", error: err.message });
  }
};

// Controller to handle fetching all roles
export const getAllRolesController = async (req, res) => {
  try {
    const roles = await getRoles();
   res.status(200).json({ data: roles });
  } catch (err) {
    res.status(500).json({ message: "Error fetching roles", error: err.message });
  }
};
