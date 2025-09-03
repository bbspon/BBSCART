const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Stores the issuance of a temporary password for a vendor user.
 * We NEVER store the plaintext; only a bcrypt hash + metadata.
 * TTL cleans up records after e.g. 30 days.
 */
const VendorCredentialIssueSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
      index: true,
    },
    email: { type: String, required: true, index: true },

    // bcrypt hash of the temporary password we emailed
    tempPasswordHash: { type: String, required: false },

    // force vendor to change password on first login
    mustChangePassword: { type: Boolean, default: true },

    // delivery/audit
    deliveredAt: { type: Date }, // set when email sent OK
    deliveryStatus: { type: String, default: "pending" }, // pending | sent | failed
    deliveryError: { type: String },

    // housekeeping
    expiresAt: { type: Date, index: true }, // TTL index
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin who issued
  },
  { timestamps: true }
);

// TTL: auto-remove after 30 days
VendorCredentialIssueSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model(
  "VendorCredentialIssue",
  VendorCredentialIssueSchema
);
