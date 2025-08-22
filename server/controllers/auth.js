import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

import * as Otp from "../models/OtpEntry.js";
import * as User from "../models/User.js";
import { findOrCreateAddress } from "../models/Address.js";
import { getRoleById } from "../models/Role.js";
// Controller to send OTP to a contact number for registration

export const sendOtpController = async (req, res) => {
  const { contact } = req.body;
  if (!contact) {
    return res.status(400).json({ message: "Contact number is required." });
  }

  try {
    // Check if contact is already linked to an existing user
    const existingUser = await User.findUserByContactOrEmail(contact);
    if (existingUser) {
      return res.status(409).json({
        message: "This contact is already registered. Please try logging in.",
      });
    }

    // Generate OTP (4 digits) and set expiry time (10 min)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Create or update OTP entry in DB
    await Otp.findOrCreateOtp(contact, otp, otpExpires);

    // Send OTP back in response (for demo/testing — in production send via SMS)
    res.status(201).json({ message: `OTP sent to ${contact} is ${otp}.` });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};

// Controller to verify OTP for a given contact

export const verifyOtpController = async (req, res) => {
  const { contact } = req.params;
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ message: "OTP is required." });

  try {
    // Get OTP record from DB
    const tempEntry = await Otp.findOtpByContact(contact);
    if (!tempEntry)
      return res.status(404).json({ message: "Please request an OTP first." });

    // Validate OTP and expiry
    if (
      tempEntry.otp !== otp ||
      new Date(tempEntry.otp_expires_at) < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark OTP as verified
    await Otp.verifyOtp(contact);
    res.status(200).json({
      message: "OTP verified successfully.",
      contact: tempEntry.contact,
    });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

// Controller to register a new user

export const registerController = async (req, res) => {
  const {
    name,
    email,
    password,
    contact,
    address,
    details,
    role_id,
    designation,
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !email ||
    !password ||
    !contact ||
    !address ||
    !details ||
    !role_id
  ) {
    return res
      .status(400)
      .json({ message: "Missing one or more required fields." });
  }

  try {
    // Check if contact is OTP-verified
    const tempEntry = await Otp.findOtpByContact(contact);
    if (!tempEntry || !tempEntry.is_verified) {
      return res
        .status(403)
        .json({ message: "Contact number must be verified first." });
    }

    // Ensure email is unique
    const existingUser = await User.findUserByContactOrEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    // Validate role existence
    const roleDoc = await getRoleById(role_id);
    if (!roleDoc) {
      return res
        .status(404)
        .json({ message: `Role with ID '${role_id}' not found.` });
    }

    // --- 1. Determine the user's active status based on role ---
    let userStatus;
    if (roleDoc.role === "Client" || roleDoc.role === "RBSPL Employee") {
      userStatus = false;
    } else {
      userStatus = true;
    }

    // Save address in DB
    const savedAddress = await findOrCreateAddress(address);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in DB with the CORRECT `status` field
    const newUser = await User.createUser({
      name,
      email,
      password: hashedPassword,
      contact,
      address_id: savedAddress.id,
      is_active: userStatus,
      role_id,
      details,
      designation,
      has_admin_access: false,
    });

    // Cleanup OTP entry
    await Otp.deleteOtp(contact);

    // --- 2. Only log in the user if their status is "Active" ---
    if (userStatus) {
      // User is active, generate tokens and log them in
      const Token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(201).json({
        message: "User registered successfully!",
        Token,
        newUser,
      });
    } else {
      // User is "Pending", send appropriate message and DO NOT send tokens
      return res.status(201).json({
        message:
          "Registration successful! Your account is pending approval from an administrator.",
        user: newUser,
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      message: "Server error during registration.",
      error: err.message,
    });
  }
};
export const registerbyadmin = async (req, res) => {
  const {
    name,
    email,
    password,
    contact,
    address,
    details,
    role_id,
    designation,
  } = req.body;

  try {
    const existingUser = await User.findUserByContactOrEmail(contact || email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this contact or email already exists" });
    }
    const savedAddress = await findOrCreateAddress(address);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.createUser({
      name,
      email,
      password: hashedPassword,
      contact,
      address_id: savedAddress.id,
      is_active: true,
      role_id,
      details,
      designation,
      has_admin_access: false,
    });
    const Token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created by admin successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        has_admin_access: user.has_admin_access,
      },
      Token,
    });
  } catch (err) {
    console.error("Admin register error:", err);
    res.status(500).json({ message: "Server error during admin registration" });
  }
};

// Controller to log in an existing user

export const loginController = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Email/contact and password are required." });
  }

  try {
    // Find user by email or contact
    const user = await User.findUserByContactOrEmail(identifier);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check password
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message:
          "Your account is pending approval. Please wait for an administrator to activate it.",
      });
    }

    // Get role info
    const roleDoc = await getRoleById(user.role_id);
    if (!roleDoc) {
      return res
        .status(404)
        .json({ message: `Role with ID '${user.role_id}' not found.` });
    }

    // Generate tokens
    const Token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "35m",
    });

    // Fetch and send full user details
    const userDetails = await User.findUserWithDetailsById(user.id);

    res.status(200).json({
      message: "Logged in successfully",
      Token,
      user: {
        ...userDetails,
        role: roleDoc.name, // attach role info here
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Controller to log out a user
export const logoutController = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};
