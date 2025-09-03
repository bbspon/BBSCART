const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Explicitly import ObjectId from mongoose.Schema.Types
const { ObjectId } = mongoose.Schema.Types;

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: [
        "user",
        "admin",
        "seller",
        "customer",
        "agent",
        "territory_head",
        "franchise_head",
      ],
      default: "user",
    },
    name: String,
    email: { type: String, unique: true }, // User's email (unique)
    password: String, // Encrypted user password
    refreshToken: String,
    userdetails: { type: ObjectId, ref: "UserDetails" },
    created_at: { type: Date, default: Date.now }, // Account creation date
    updated_at: { type: Date, default: Date.now }, // Last updated date
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    status: { type: String, enum: ["active", "disabled"], default: "active" },

    mustChangePassword: { type: Boolean, default: true },
    passwordResetToken: { type: String }, // random 32-byte hex
    passwordResetExpires: { type: Date }, // Date.now() + 48h
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.statics.hashPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};
const User = mongoose.model("User", UserSchema);
module.exports = User;
