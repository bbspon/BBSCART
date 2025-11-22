const mongoose = require("mongoose");

const VendorIdentityCardSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true }, // This is your vendor’s unique code (like VEND1234)

    // Personal Info
    name: String,
    address: String,
    age: Number,
    bloodGroup: String,
    donorId: String,
    profileImg: String, // file path
    volunteerdonor: String,
    contactNumber: String,
    emergencyContact: String,
    allergies: String,

    // Vendor / Company Info
    companyName: String,
    services: String,

    // License Info
    licenseNumber: String,
    dateOfIssue: String,
    expiryDate: String,

    // Extra
    languages: String,
    regionalCode: String,

    // Signature file
    signature: String, // file path
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "VendorIdentityCard",
  VendorIdentityCardSchema,
  "vendor_identity_cards"
);
