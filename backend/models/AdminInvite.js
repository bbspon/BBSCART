const mongoose = require("mongoose");

const AdminInviteSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  role: { type: String, enum: ["admin"], default: "admin" },
  tokenHash: { type: String, required: true },        // bcrypt hash of rawToken
  expiresAt: { type: Date, required: true },          // e.g., now + 72h
  usedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // superadmin id
}, { timestamps: true });

module.exports = mongoose.model("AdminInvite", AdminInviteSchema);
