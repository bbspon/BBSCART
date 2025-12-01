const mongoose = require("mongoose");

const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const Cart = require("../models/Cart");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const redis = require("redis");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const AdminInvite = require("../models/AdminInvite");
const { sendAdminInviteEmail } = require("../utils/mailer");

const client = redis.createClient();
client.connect().catch(console.error);

const { Resend } = require("resend");
const resend = new Resend("re_Kwdg2csA_A3De7JEabPeYrUMCKPZD1BnZ");

// Function to generate a 7-digit alphanumeric referral code
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 7);
};

// 📌 Geocode Address using Ola Map API
const geocodeAddress = async (address) => {
  const API_KEY = process.env.OLA_MAP_API_KEY; // Replace with your actual API key
  const url = `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(address)}&language=English&api_key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    console.log("geocodeAddress response:", response.data);

    if (
      response.data.geocodingResults &&
      response.data.geocodingResults.length > 0
    ) {
      return {
        latitude: response.data.geocodingResults[0].geometry.location.lat,
        longitude: response.data.geocodingResults[0].geometry.location.lng,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Register user
exports.register = async (req, res) => {
  const { name, email, phone, password, referredBy, role, confirmPassword } =
    req.body;

  // Basic confirm check (optional but recommended)
  if (typeof confirmPassword !== "undefined" && confirmPassword !== password) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  // whitelist role (map 'vendor' from UI to 'seller')
  const ALLOWED = ["user", "customer"];
  const safeRole = ALLOWED.includes(String(req.body.role))
    ? req.body.role
    : "customer";

  try {
    // ✅ Check if user already exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // ✅ Validate Referral Code
    let referrer = null;
    if (referredBy) {
      referrer = await UserDetails.findOne({ referralCode: referredBy });
      if (!referrer) {
        return res.status(400).json({ msg: "Invalid referral code" });
      }
    }

    // ✅ Generate unique referral code
    const referralCode = generateReferralCode();

    // ✅ Hash the password first
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create and save the User FIRST
    let user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: safeRole,
    });
    await user.save();

    // ✅ Create and save UserDetails NEXT
    const userDetails = new UserDetails({
      userId: user._id,
      referralCode,
      referredBy: referrer ? referrer.userId : null,
      phone,
    });
    await userDetails.save();

    // ✅ Link back on the user and save
    user.userdetails = userDetails._id;
    await user.save();

    // ✅ Merge guest cart if session exists (safe optional check)
    if (req.session?.userId) {
      await mergeGuestCartWithUser(req.session.userId, user._id);
      req.session.userId = null;
    }

    // ✅ Generate Access Token (Short Expiry)
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Generate Refresh Token (Longer Expiry)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set tokens as HttpOnly cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Send response without exposing tokens
    return res.status(201).json({
      msg: "User registered successfully",
      user,
      userDetails,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({ msg: "User already exists" });
    }
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Login controller
// Login controller (PATCHED)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email })
      .populate("userdetails")
      .select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Merge guest cart if needed
    if (req.session.userId) {
      await mergeGuestCartWithUser(req.session.userId, user._id);
      req.session.userId = null;
    }

    // ⭐ Generate Access Token (SEND TO FRONTEND)
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ⭐ Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies (same as before)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ⭐⭐⭐ SEND TOKEN IN RESPONSE BODY (missing in your old code)
    return res.status(200).json({
      message: "Login successful",
      token: accessToken, // ⭐ REQUIRED by frontend
      refreshToken: refreshToken, // optional but useful
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        details: user.userdetails,
        vendor_id: user.vendor_id || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Function to merge guest cart with logged-in user cart
const mergeGuestCartWithUser = async (sessionUserId, realUserId) => {
  try {
    const sessionCart = await Cart.find({ user: sessionUserId });
    const userCart = await Cart.find({ user: realUserId });

    for (const sessionItem of sessionCart) {
      const existingItem = userCart.find(
        (item) => item.product.toString() === sessionItem.product.toString()
      );

      if (existingItem) {
        // ✅ If product already in user’s cart, update quantity
        existingItem.quantity += sessionItem.quantity;
        await existingItem.save();
      } else {
        // ✅ If new product, assign it to the logged-in user
        await Cart.create({
          user: realUserId,
          product: sessionItem.product,
          quantity: sessionItem.quantity,
          cart_id: new mongoose.Types.ObjectId().toString(),
        });
      }
    }

    // ✅ Remove session cart after merging
    await Cart.deleteMany({ user: sessionUserId });
  } catch (error) {
    console.error("Error merging guest cart:", error);
  }
};

exports.sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a password reset token (e.g., JWT with a short expiration)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.REACT_APP_CLI_URL}/reset-password/${token}`;

    (async function () {
      const { data, error } = await resend.emails.send({
        from: "BBSCart <info@bbscart.com>",
        to: [email],
        subject: "Password Reset Request",
        html: `
            <div style="font-family: Montserrat, sans-serif; line-height: 1.6;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 15px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you didn't request this, please ignore this email or contact support if you have questions.</p>
                <p>Thank you!</p>
                <p><strong>Your App Team</strong></p>
                <hr>
                <p style="font-size: 12px; color: #555;">If the button above doesn't work, copy and paste the following URL into your browser:</p>
                <p style="font-size: 12px; color: #555;">${resetLink}</p>
            </div>
            `,
      });

      if (error) {
        return console.error({ error });
      }
      console.log({ data });
    })();

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const token = req.params?.token || req.body?.token;
    const { password, confirmPassword } = req.body || {};

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }
    if (
      typeof confirmPassword !== "undefined" &&
      password !== confirmPassword
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Decode if token came URL-encoded from the UI
    const decodedToken = decodeURIComponent(token);

    let payload;
    try {
      payload = jwt.verify(decodedToken, process.env.JWT_SECRET);
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (err) {
    console.error("[resetPassword]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout user (Blacklist Token)
exports.logout = async (req, res) => {
  try {
    // Get token from cookies (since it's HttpOnly)
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiry = decoded.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 86400; // 24-hour expiry fallback

    // Add token to blacklist in Redis
    await client.setEx(token, expiry, "blacklisted");

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Check if user is logged in
exports.checkAuth = async (req, res) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const isBlacklisted = await client.get(token);
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token expired. Please login again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ userId: decoded.userId, role: decoded.role });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userInfo = await User.findById(decoded.userId).populate(
      "userdetails"
    );
    res.status(200).json({ userInfo });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Update User Profile
// UPDATE PROFILE (FINAL FIXED VERSION)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing or invalid",
      });
    }

    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build the safe user object to return
    const safeUser = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || "",
      role: updatedUser.role,
      vendor_id: updatedUser.vendor_id || null,
    };

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (err) {
    console.log("UPDATE PROFILE ERROR", err);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};

exports.getUser = async (req, res) => {
  console.log("Cookies:", req.cookies);

  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console;
    let user = await User.findById(decoded.userId)
      .populate("userdetails")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("getUser user - ", user);

    return res.status(200).json({
      message: "Getting UserInfo",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        details: user.userdetails, // ✅ Corrected field name
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.authRefershToken = async (req, res) => {
  console.log("authRefershToken - ", req.cookies);
  const refreshToken = req.cookies.refreshToken; // ✅ Get refresh token from cookies
  if (!refreshToken) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    // ✅ Generate a new access token
    const accessToken = generateAccessToken(user);

    // ✅ Send new token in HttpOnly cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

exports.verifySetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "Token required" });

    const user = await User.findOne({ passwordResetToken: token });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid token" });

    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({ success: false, message: "Token expired" });
    }

    return res.json({ success: true, email: user.email });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify token" });
  }
};

// Set password with token
exports.setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Token and password are required" });
    }
    if (
      String(password).length < 8 ||
      !/[0-9]/.test(password) ||
      !/[A-Za-z]/.test(password)
    ) {
      return res.status(400).json({ success: false, message: "Weak password" });
    }

    const user = await User.findOne({ passwordResetToken: token });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid token" });
    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({ success: false, message: "Token expired" });
    }

    user.password = await User.hashPassword(password);
    user.mustChangePassword = false;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ success: true, message: "Password set successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to set password" });
  }
};

// POST /api/auth/admin-invites  (SuperAdmin only)
exports.createAdminInvite = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    // prevent duplicate active invite
    const now = new Date();
    await AdminInvite.deleteMany({
      email,
      usedAt: null,
      expiresAt: { $lt: now },
    }); // clean old
    const exists = await User.findOne({ email });
    if (exists && exists.role === "admin") {
      return res
        .status(409)
        .json({ success: false, message: "User is already an Admin" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 72); // 72h

    const invite = await AdminInvite.create({
      email,
      tokenHash,
      expiresAt,
      createdBy: req.user?._id,
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${rawToken}&email=${encodeURIComponent(
      email
    )}`;

    await sendAdminInviteEmail({ to: email, inviteUrl });

    return res
      .status(201)
      .json({ success: true, message: "Invite sent", id: invite._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/admin-invites/accept
// body: { email, token, name, phone, password }
exports.acceptAdminInvite = async (req, res, next) => {
  try {
    const { email, token, name, phone, password } = req.body;
    if (!email || !token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const invite = await AdminInvite.findOne({ email, usedAt: null });
    if (!invite)
      return res
        .status(400)
        .json({ success: false, message: "Invalid invite" });
    if (new Date() > invite.expiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "Invite expired" });
    }

    const ok = await bcrypt.compare(token, invite.tokenHash);
    if (!ok)
      return res.status(400).json({ success: false, message: "Invalid token" });

    // Create or elevate the user to admin
    let user = await User.findOne({ email });
    if (!user) {
      const hashed = await User.hashPassword(password);
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: hashed,
        confirmPassword: hashed, // your schema currently keeps it; ideally remove later
        phone: phone || "",
        role: "admin",
        mustChangePassword: false,
        status: "active",
      });
    } else {
      // elevate to admin if not already
      if (user.role !== "admin") {
        user.role = "admin";
        if (password) user.password = await User.hashPassword(password);
        user.mustChangePassword = false;
        await user.save();
      }
    }

    invite.usedAt = new Date();
    await invite.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Admin account activated. You can log in now.",
      });
  } catch (err) {
    next(err);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email, phone },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};