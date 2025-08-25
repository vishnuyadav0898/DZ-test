import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Op } from "sequelize";

import OtpEntry from "../models/OtpEntry.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import Role from "../models/Role.js";
import Plant from "../models/Plant.js";
import sequelize from "../sequelize.js"; // Import the sequelize instance

// --- Helper Function to Generate JWT ---
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// -------------------- Send OTP Controller --------------------
export const sendOtpController = async (req, res) => {
  const { contact } = req.body;
  if (!contact) {
    return res.status(400).json({ message: "Contact number is required." });
  }

  try {
    const existingUser = await User.findOne({ where: { contact } });
    if (existingUser) {
      return res.status(409).json({ message: "This contact is already registered. Please login." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpEntry.upsert({
      contact,
      otp,
      otp_expires_at: otpExpires,
    });

   
    res.status(201).json({ message: `OTP sent to ${contact}.`, otp });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};

// -------------------- Verify OTP Controller --------------------
export const verifyOtpController = async (req, res) => {
  const { contact } = req.params;
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ message: "OTP is required." });

  try {
    const tempEntry = await OtpEntry.findOne({ where: { contact } });
    if (!tempEntry) {
      return res.status(404).json({ message: "Please request an OTP first." });
    }

    if (tempEntry.otp !== otp || new Date(tempEntry.otp_expires_at) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    await tempEntry.update({ is_verified: true });
    res.status(200).json({ message: "OTP verified successfully.", contact });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

export const registerController = async (req, res) => {
  const { name, email, password, contact, address, details, role_id, designation } = req.body;

  if (!name || !email || !password || !contact || !address || !role_id) {
    return res.status(400).json({ message: "Missing one or more required fields." });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // 1. Check for existing user, create address, etc.
      const existingUser = await User.findOne({
        where: { [Op.or]: [{ email }, { contact }] },
        transaction: t,
      });

      if (existingUser) {
        throw { status: 409, message: "A user with this email or contact already exists." };
      }
      
      const roleDoc = await Role.findByPk(role_id, { transaction: t });
      if (!roleDoc) throw { status: 404, message: `Role with ID '${role_id}' not found.` };
      
      const savedAddress = await Address.create(address, { transaction: t });
      const hashedPassword = await bcrypt.hash(password, 10);
      const is_active = !["Client", "RBSPL Employee"].includes(roleDoc.name);
      
      // 2. Create User
      const newUser = await User.create({
        name, email, password: hashedPassword, contact,
        address_id: savedAddress.id,
        role_id: roleDoc.id,
        plant_id: details?.plant_id || null,
        is_active, details, designation,
      }, { transaction: t });

      // 3. Fetch the complete user object with NESTED associations
      const userWithDetails = await User.findByPk(newUser.id, {
        include: [
          { model: Role, as: 'role' },
          { model: Address, as: 'address' },
          {
            model: Plant,
            as: 'plant',
           
            include: [{
              model: Address,
              as: 'address' // Assumes Plant.belongsTo(Address, { as: 'address' })
            }]
          }
        ],
        transaction: t
      });

      // 4. Manually construct the final user object for the response
      const { 
        password: discardedPassword, 
        address_id: discardedAddressId, 
        role_id: discardedRoleId, 
        plant_id: discardedPlantId, // Also discard the plant_id foreign key
        ...userFields 
      } = userWithDetails.get({ plain: true });

      let plantResponse = null;
      if (userWithDetails.plant) {
        const { id: plantId, address_id: plantAddressId, ...plantFields } = userWithDetails.plant;
        const { id: addressId, ...addressFields } = userWithDetails.plant.address || {};
        plantResponse = {
          ...plantFields,
          address: userWithDetails.plant.address ? addressFields : null
        };
      }

      const finalUserResponse = {
        ...userFields,
        role: userWithDetails.role ? userWithDetails.role.name : null,
        address: userWithDetails.address ? {
            street: userWithDetails.address.street,
            city: userWithDetails.address.city,
            state: userWithDetails.address.state,
            country_code: userWithDetails.address.country_code,
            pincode: userWithDetails.address.pincode,
        } : null,
        plant: plantResponse,
      };

      // 5. Generate Token and prepare response
      const token = is_active ? generateToken(newUser.id) : null;
      const message = is_active
        ? "User registered successfully!"
        : "Registration successful! Your account is pending administrator approval.";

      return { status: 201, body: { message, token, user: finalUserResponse } };
    });

    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(err.status || 500).json({ message: err.message || "Server error during registration." });
  }
};


// -------------------- Admin Registration Controller --------------------
export const registerByAdminController = async (req, res) => {
  const { name, email, password, contact, address, details, role_id, designation } = req.body;

  if (!name || !email || !password || !contact || !address || !role_id) {
    return res.status(400).json({ message: "Missing one or more required fields." });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      // 1. Check for existing user by email or contact
      const existingUser = await User.findOne({
        where: { [Op.or]: [{ email }, { contact }] },
        transaction: t
      });
      if (existingUser) {
        throw { status: 409, message: "A user with this email or contact already exists." };
      }

      // 2. Find or Create Address
      const [savedAddress] = await Address.findOrCreate({
        where: { ...address },
        transaction: t,
      });

      // 3. Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 4. Create User (always active when created by an admin)
      const newUser = await User.create({
        name, email, password: hashedPassword, contact,
        address_id: savedAddress.id, is_active: true, role_id,
        details, designation
      }, { transaction: t });

      const token = generateToken(newUser.id);
      const { password: _, ...userResponse } = newUser.get({ plain: true });

      return {
        status: 201,
        body: { message: "User created by admin successfully.", token, user: userResponse },
      };
    });

    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Admin Registration Error:", err);
    res.status(err.status || 500).json({ message: err.message || "Server error during admin registration." });
  }
};


// -------------------- Login Controller --------------------
export const loginController = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: "Email/contact and password are required." });
  }

  try {
    const user = await User.findOne({
      where: { [Op.or]: [{ email: identifier }, { contact: identifier }] },
      include: [
        { model: Role, as: "role" },
        { model: Address, as: "address" },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Your account is pending approval or has been deactivated." });
    }

    const token = generateToken(user.id);
    const { password: _, ...userResponse } = user.get({ plain: true });
    
    res.status(200).json({ message: "Logged in successfully.", token, user: userResponse });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// -------------------- Logout Controller --------------------
export const logoutController = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully." });
};
