// models/PincodeVendors.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const PincodeVendorsSchema = new Schema(
  {
    pincode: { type: String, required: true, unique: true, index: true },
    vendorIds: [{ type: Schema.Types.ObjectId, ref: "Vendor", required: true }],
    active: { type: Boolean, default: true },
    pausedVendorIds: [{ type: Schema.Types.ObjectId, ref: "Vendor" }],
    dailyStartOffset: { type: Number, default: 0 }, // optional fairness tweak
  },
  { timestamps: true }
);

module.exports = mongoose.model("PincodeVendors", PincodeVendorsSchema);
