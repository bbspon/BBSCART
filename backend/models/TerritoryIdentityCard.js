const mongoose = require("mongoose");

const TerritoryIdentityCardSchema = new mongoose.Schema(
  {
    territoryId: { type: String, required: true }, // manually typed or from login

    // Personal Info
    name: String,
    age: Number,
    bloodGroup: String,
    volunteerdonor: String,
    profileImg: String,
    contactNumber: String,
    emergencyContact: String,
    allergies: String,

    // Employee / Vendor Info
    companyName: String,
    vendorId: String,
    employeeName: String,
    title: String,
    licenseNumber: String,
    licenseIssueDate: String,
    licenseExpiryDate: String,
    validityPeriod: String,
    employeeStatus: String,
    assignedManager: String,
    authorizedProducts: String,
    badgeVersion: String,
    nfcBarcode: String,
    shortVerificationURL: String,
    languagePreference: String,
    officeBranch: String,
    issuingAuthority: String,
    lastBackgroundVerification: String,

    // Territory Info
    area: String,
    city: String,
    district: String,
    state: String,
    region: String,
    territoryCode: String,
    geoCode: String,
    geoBoundRules: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "TerritoryIdentityCard",
  TerritoryIdentityCardSchema,
  "territory_identity_cards"
);
