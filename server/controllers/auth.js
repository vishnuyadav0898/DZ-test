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
      return res
        .status(409)
        .json({
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
    res
      .status(200)
      .json({
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
    profile_image,
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
    !profile_image||
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
      profile_image,
      is_active: userStatus,
      role_id,
      details,
      designation,
    });
   
    
    // Cleanup OTP entry
    await Otp.deleteOtp(contact);

    // --- 2. Only log in the user if their status is "Active" ---
    if (userStatus) {
      // User is active, generate tokens and log them in
      const accessToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: "35m",
      });
      const refreshToken = jwt.sign(
        { id: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      await User.updateUserRefreshToken(newUser.id, refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(201)
        .json({
          message: "User registered successfully!",
          accessToken,
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
    return res
      .status(500)
      .json({
        message: "Server error during registration.",
        error: err.message,
      });
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

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({
          message:
            "Your account is pending approval. Please wait for an administrator to activate it.",
        });
    }

    // Generate tokens
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "35m",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Save refresh token in DB
    await User.updateUserRefreshToken(user.id, refreshToken);

    // Send refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Fetch and send full user details
    const userDetails = await User.findUserWithDetailsById(user.id);
    res
      .status(200)
      .json({ message: "Logged in successfully", accessToken, userDetails });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Controller to log out a user
export const logoutController = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.sendStatus(204); // No content if no token exists

  try {
    // Find and clear refresh token from DB
    const user = await User.findUserByRefreshToken(refreshToken);
    if (user) {
      await User.updateUserRefreshToken(user.id, null);
    }

    // Remove cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error during logout." });
  }
};

//Controller to refresh an access token using a valid refresh token

export const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  try {
    // Decode and verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Ensure refresh token matches one in DB
    const user = await User.findUserByRefreshToken(refreshToken);
    if (!user || user.id !== decoded.id) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "35m",
    });
    res
      .status(200)
      .json({ accessToken: newAccessToken, message: "Access token refreshed" });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token." });
  }
};
