const mongoose = require("mongoose");

const customerVendorAssignmentSchema = new mongoose.Schema(
  {
    customerKey: { type: String, required: true, index: true },
    pincode: { type: String, required: true, index: true },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
      index: true,
    },
    // YYYY-MM-DD (store/server local date)
    dateKey: { type: String, required: true, index: true },
    // optional TTL-style helpers if you want later:
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Only one assignment per customer+pincode per day
customerVendorAssignmentSchema.index(
  { customerKey: 1, pincode: 1, dateKey: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "CustomerVendorAssignment",
  customerVendorAssignmentSchema
);
