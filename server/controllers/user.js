import User from "../models/User.js";
import Role from "../models/Role.js";
import Address from "../models/Address.js";

const includeDetails = [
  { model: Role, as: "role" },
  { model: Address, as: "address" },
];

// -------------------- Get Currently Logged-In User --------------------
export const getCurrentUserController = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: includeDetails,
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ message: "Server error while retrieving user." });
  }
};

// -------------------- Get Any User by ID --------------------
export const getUserByIdController = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: includeDetails,
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error("Get User by ID Error:", err);
    res.status(500).json({ message: "Server error while retrieving user." });
  }
};

// -------------------- Get All Users --------------------
export const getAllUsersController = async (req, res) => {
  try {
    const users = await User.findAll({
      include: includeDetails,
      attributes: { exclude: ["password"] },
    });
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// -------------------- Update a User's Active Status --------------------
export const updateUserStatusController = async (req, res) => {
  let { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "The 'isActive' field must be a boolean." });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.is_active = isActive;
    await user.save();

    res.status(200).json({ message: "User status updated successfully.", user });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error while updating user status." });
  }
};
