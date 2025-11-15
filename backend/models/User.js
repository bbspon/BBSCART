const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Explicitly import ObjectId from mongoose.Schema.Types
const { ObjectId } = mongoose.Schema.Types;

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: [
        "admin",
        "customer",
        "vendor",
        "agent",
        "seller",
        "franchise",
        "territory",
        "cbav",
        "logistics",
        "health",
      ],
      default: "customer",
    },

    // Basic identity
    name: String,
    email: { type: String, unique: true }, // User's email (unique)
    password: String, // Encrypted user password
    confirmPassword: String, // Encrypted user password (legacy)
    refreshToken: String,

    // Extra profile ref
    userdetails: { type: ObjectId, ref: "UserDetails" },

    // Legacy timestamps (kept for compatibility)
    created_at: { type: Date, default: Date.now }, // Account creation date
    updated_at: { type: Date, default: Date.now }, // Last updated date

    // Old vendor link used by some legacy code
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    // NEW: unified partner linkage fields used by CRM + BBSCART
    // These are what createPartnerUser() and login.js already expect.
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FranchiseHead",
      default: null,
    },
    territoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TerritoryHead",
      default: null,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },

    // Password lifecycle
    mustChangePassword: { type: Boolean, default: true },
    passwordResetToken: { type: String }, // random 32-byte hex
    passwordResetExpires: { type: Date }, // Date.now() + 48h
  },
  { timestamps: true }
);

// Compare password helper
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Hash password helper
UserSchema.statics.hashPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
