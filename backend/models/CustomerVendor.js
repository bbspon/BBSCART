const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const RequiredAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const OptionalAddressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { _id: false }
);

const CoordsSchema = new mongoose.Schema(
  {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false }
);

const CustomerVendorSchema = new mongoose.Schema({
  // personal
  vendor_fname: { type: String, default: "" },
  vendor_lname: { type: String, default: "" },
  gender: { type: String, default: "" },
  dob: { type: Date, default: null },

  // contact
  email: { type: String, default: "" },
  mobile: { type: String, default: "" },
  alt_mobile: { type: String, default: "" },

  // KYC
  pan_number: { type: String, index: true, default: "" },
  pan_pic: { type: String, default: null },
  aadhar_number: { type: String, index: true, default: "" },
  aadhar_pic_front: { type: String, default: null },
  aadhar_pic_back: { type: String, default: null },

  // addresses
  register_business_address: { type: RequiredAddressSchema, required: false },
  operational_address: { type: OptionalAddressSchema, default: undefined },

  // GST block
  gst_number: { type: String, index: true, default: "" },
  gst_legal_name: { type: String, default: "" },
  gst_constitution: { type: String, default: "" },
  gst_cert_pic: { type: String, default: null },
  gst_address: {
    floorNo: { type: String, default: "" },
    buildingNo: { type: String, default: "" },
    street: { type: String, default: "" },
    locality: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },

  // bank
  bank_name: { type: String, default: "" },
  account_holder_name: { type: String, default: "" },
  account_no: { type: String, default: "" },
  ifcs_code: { type: String, default: "" },
  branch_name: { type: String, default: "" },
  bank_address: { type: String, default: "" },
  cancel_cheque_passbook: { type: String, default: null },

  // outlet
  outlet_name: { type: String, default: "" },
  outlet_manager_name: { type: String, default: "" },
  outlet_contact_no: { type: String, default: "" },
  outlet_phone_no: { type: String, default: "" },
  outlet_location: { type: OptionalAddressSchema, default: undefined },
  outlet_coords: { type: CoordsSchema, default: undefined },
  outlet_nameboard_image: { type: String, default: null }, // filename only

  // misc media
  profile_pic: { type: String, default: null },
  cover_pic: { type: String, default: null },

  // legal/consents
  address_proof: { type: String, default: "" },
  termsConditions: { type: Boolean, default: false },
  privacyPolicy: { type: Boolean, default: false },
  sellerPolicy: { type: Boolean, default: false },

  // linkage
  user_id: { type: ObjectId, ref: "User", default: null },

  role: { type: String, enum: ["customer_vendor"], default: "customer_vendor" },

  // status
  is_active: { type: Boolean, default: false },
  is_decline: { type: Boolean, default: false },
  decline_reason: { type: String, default: null },

  // audit
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
    application_status: {
    type: String,
    enum: ["draft", "submitted", "under_review", "approved", "rejected"],
    default: "draft",
  },
  submitted_at: { type: Date, default: null },

});

CustomerVendorSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("CustomerVendor", CustomerVendorSchema);
