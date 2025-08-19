import * as User from '../models/User.js';

// Get currently logged-in user
export const getCurrentUserController = async (req, res) => {
  try {
    const user = await User.findUserWithDetailsById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('Get User Error:', err);
    res.status(500).json({ message: 'Server error while retrieving user.' });
  }
};

// Get any user by ID
export const getUserByIdController = async (req, res) => {
  try {
    const user = await User.findUserWithDetailsById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('Get User by ID Error:', err);
    res.status(500).json({ message: 'Server error while retrieving user.' });
  }
};

// Update a user's active status
export const updateUserStatusController = async (req, res) => {
  let { isActive } = req.body;

  if (typeof isActive === 'string') {
    isActive = isActive.toLowerCase() === 'true';
  }

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: "The 'isActive' field must be a boolean." });
  }

  try {
    const updated = await User.updateUserStatus(req.params.id, isActive);
    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = await User.findUserWithDetailsById(req.params.id);
    res.status(200).json({ message: 'User status updated successfully.', user });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error while updating user status.' });
  }
};

// Get all users
export const getAllUsersController = async (req, res) => {
  try {
    const users = await User.findAllUsersWithDetails();
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error('Get All Users Error:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};
