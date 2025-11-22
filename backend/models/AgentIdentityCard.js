const mongoose = require("mongoose");

const AgentIdentityCardSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true }, // manually typed or from CRM login

    // Personal Info
    name: String,
    address: String,
    age: Number,
    contactNumber: String,
    emergencyContact: String,
    allergies: String,
    profileImg: String,
    signature: String,

    // Agent Info
    agentType: String,
    organizationId: String,
    organizationName: String,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AgentIdentityCard",
  AgentIdentityCardSchema,
  "agent_identity_cards"
);
    