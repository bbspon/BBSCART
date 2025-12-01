const mongoose = require("mongoose");

const customerVendorSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true }, // Auto or manual vendor id

    // Personal Details
    fullName: String,
    email: String,
    phone: String,
    address: String,

    // Business Details
    shopName: String,
    shopType: String,
    gstNumber: String,
    businessAddress: String,
    operatingHours: String,
    deliveryPincode: String,

    // Document uploads
    profilePhoto: String,
    shopPhoto: String,
    idProofFront: String,
    idProofBack: String,

    // Status
    approvalStatus: {
      type: String,
      default: "pending", // pending / approved / rejected
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "IdentityCardCustomerBecomeVendor",
  customerVendorSchema,
  "IdentityCardCustomerBecomeVendor"
);
