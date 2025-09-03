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
  const { name, email, phone, password, referredBy } = req.body;

  try {
    // ✅ Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
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

    // ✅ Create new user
    user = new User({ name, email, phone, password });

    // ✅ Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // ✅ Save user to the database
    await user.save();

    // ✅ Create UserDetails record
    const userDetails = new UserDetails({
      userId: user._id,
      referralCode,
      referredBy: referrer ? referrer.userId : null, // Save referrer if valid
      phone,
    });

    await userDetails.save();

    // ✅ Link User to UserDetails
    user.userdetails = userDetails._id;
    await user.save();

    // ✅ Merge guest cart with registered user cart (if applicable)
    if (req.session.userId) {
      await mergeGuestCartWithUser(req.session.userId, user._id);
      req.session.userId = null; // Clear session cart after merging
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
    res.status(200).json({
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

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Merge guest cart with logged-in user cart (if applicable)
    if (req.session.userId) {
      await mergeGuestCartWithUser(req.session.userId, user._id);
      req.session.userId = null; // Clear session cart after merging
    }

    // ✅ Generate Access Token (Short Expiry)
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Access token valid for 1 hour
    );

    // ✅ Generate Refresh Token (Longer Expiry)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" } // Refresh token valid for 7 days
    );

    // ✅ Store refreshToken securely in the database
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Set HttpOnly Cookie for Access Token
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "Strict", // Protects against CSRF
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Send response with refreshToken and user data (without password)
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        details: user.userdetails, // ✅ Corrected field name
      },
    });

    // console.log('Login Res - ',res);
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
  const { token } = req.params;
  const { password } = req.body;

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash the new password and update it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
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
exports.updateProfile = async (req, res) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userInfo = await User.findById(decoded.userId).populate(
      "userdetails"
    );

    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user name if provided
    if (req.body.name) {
      userInfo.name = req.body.name;
    }

    // Ensure userDetails exists
    if (userInfo.userdetails) {
      let userDetails = await UserDetails.findById(userInfo.userdetails._id);
      if (userDetails) {
        // Replace the address instead of pushing a new one
        if (req.body.address) {
          let address = req.body.address;
          let fullAddress = `${address.street},${address.city},${address.state},${address.country},${address.postalCode}`;

          // Wait for geocoding response
          const location = await geocodeAddress(fullAddress);

          console.log("location", location);

          userDetails.addresses = req.body.address; // Replace with new address
          userDetails.latitude = location?.latitude || null;
          userDetails.longitude = location?.longitude || null; // Fix: Assign correct longitude
        }

        // Handle profile picture upload
        if (req.files && req.files[0]?.fieldname === "profilePic") {
          console.log("Profile picture uploaded:", req.files[0]);

          const uploadedFile = req.files[0]; // Get the uploaded file
          const fileExtension = path.extname(uploadedFile.originalname);
          const uniqueFileName = `profile_${decoded.userId}_${Date.now()}${fileExtension}`;
          const uploadPath = path.join(__dirname, "../uploads", uniqueFileName);

          // Remove the previous profile picture if it exists
          if (userDetails.profilePic) {
            const oldImagePath = path.join(
              __dirname,
              "../",
              userDetails.profilePic
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath); // Delete old file
              console.log(
                "Old profile picture deleted:",
                userDetails.profilePic
              );
            }
          }

          // Move uploaded file to the uploads directory
          fs.renameSync(uploadedFile.path, uploadPath);

          // Save unique filename to database
          userDetails.profilePic = `/uploads/${uniqueFileName}`;
        } else {
          console.log("No new profile picture uploaded", req.body);
        }

        userDetails.updated_at = new Date(); // Update timestamp
        await userDetails.save(); // Save changes
      }
    }

    await userInfo.save(); // Save updated user info

    // Fetch updated user details
    const updatedUserInfo = await User.findById(decoded.userId).populate(
      "userdetails"
    );

    res.status(200).json({
      message: "Profile updated successfully",
      userInfo: updatedUserInfo,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
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