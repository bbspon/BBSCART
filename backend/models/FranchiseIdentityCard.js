const mongoose = require("mongoose");

const FranchiseIdentitySchema = new mongoose.Schema(
  {
    franchiseId: { type: String, required: true },

    // Personal / Franchise Info
    name: String,
    address: String,
    age: Number,
    profileImg: String,

    franchiseType: String,
    contactNumber: String,
    emergencyContact: String,
    allergies: String,

    // Parent Company Info
    parentCompanyId: String,
    parentCompanyName: String,
    services: String,

    // Territory Info
    area: String,
    city: String,
    district: String,
    state: String,
    region: String,

    // Professional / License Info
    companyName: String,
    licenseNumber: String,
    dateOfIssue: String,
    expiryDate: String,
    languagesSpoken: String,

    // Signature
    signature: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "FranchiseIdentityCard",
  FranchiseIdentitySchema,
  "franchise_identity_cards"
);
