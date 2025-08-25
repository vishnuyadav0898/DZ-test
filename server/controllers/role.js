import Role from "../models/Role.js"; // Changed to import the Sequelize model directly

// -------------------- Create Role --------------------
export const createRoleController = async (req, res) => {
  const { name } = req.body; // Assuming the field in the body is 'name'

  if (!name) {
    return res.status(400).json({ message: "Role name is required." });
  }

  try {
    // Check if role already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(409).json({ message: "This role already exists." });
    }

    // Use Sequelize 'create' method directly
    const newRole = await Role.create({ name });
    return res
      .status(201)
      .json({ message: "Role created successfully", data: newRole });
  } catch (err) {
    console.error("Create Role Error:", err);
    return res
      .status(500)
      .json({ message: "Error creating role", error: err.message });
  }
};

// -------------------- Get All Roles --------------------
export const getAllRolesController = async (req, res) => {
  try {
    // Use Sequelize 'findAll' method
    const roles = await Role.findAll();
    return res.status(200).json({ data: roles });
  } catch (err) {
    console.error("Get Roles Error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching roles", error: err.message });
  }
};

// -------------------- Get Role by ID --------------------
export const getRoleByIdController = async (req, res) => {
  try {
    // Use Sequelize 'findByPk' method for primary key lookup
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.status(200).json({ data: role });
  } catch (err) {
    console.error("Get Role Error:", err);
    return res
      .status(500)
      .json({ message: "Error fetching role", error: err.message });
  }
};

// -------------------- Update Role --------------------
export const updateRoleController = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ message: "Role name is required for update." });
  }

  try {
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Use Sequelize 'update' instance method
    role.name = name;
    await role.save();

    return res
      .status(200)
      .json({ message: "Role updated successfully", data: role });
  } catch (err) {
    console.error("Update Role Error:", err);
    return res
      .status(500)
      .json({ message: "Error updating role", error: err.message });
  }
};

// -------------------- Delete Role --------------------
export const deleteRoleController = async (req, res) => {
  const { id } = req.params;
  try {
    // Use Sequelize 'destroy' method
    const deleted = await Role.destroy({
      where: { id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Delete Role Error:", err);
    return res
      .status(500)
      .json({ message: "Error deleting role", error: err.message });
  }
};
