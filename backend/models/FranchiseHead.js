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
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
  },
  { _id: false }
);

const FranchiseHeadSchema = new mongoose.Schema({
  // personal
  vendor_fname: { type: String },
  vendor_lname: { type: String },
  dob: { type: Date },

  // business
  business_type: {
    type: String,
    enum: [
      "",
      "Individual",
      "Proprietorship",
      "Partnership Firm",
      "Private Limited Company",
      "Public Company",
    ],
    required: false,
    default: "",
  },
  brand_name: { type: String, default: null },
  contact_person: { type: String, default: null },

  // contact
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  alt_mobile: { type: String, default: null },

  // addresses
  register_business_address: { type: RequiredAddressSchema, required: true },
  operational_address: { type: OptionalAddressSchema, required: false },

  // profile
  education_qualify: { type: String, required: false },
  work_experience: { type: String, required: false },

  // IDs
  aadhar_number: { type: String, required: true },
  aadhar_pic_front: { type: String, default: null },
  aadhar_pic_back: { type: String, default: null },

  self_declaration: { type: String, required: true },
  criminal_history: { type: String, required: false },
  referral_details: { type: String, required: false },
  lang_proficiency: { type: String, required: false },

  pan_number: { type: String, required: true },
  pan_pic: { type: String, required: false },

  // misc licenses
  gst_number: { type: String, default: null },
  gst_pic: { type: String, false: null }, // kept as-is to match your Vendor.js
  fssai_license: { type: String, default: null },
  fssai_pic: { type: String, default: null },
  shop_establish_license: { type: String, default: null },
  shop_establish_pic: { type: String, default: null },

  outlet_location: { type: OptionalAddressSchema, required: false },
  outlet_manager_name: { type: String, default: null },
  outlet_contact_no: { type: String, default: null },

  // bank
  bank_name: { type: String, required: true },
  account_holder_name: { type: String, required: true },
  account_no: { type: String, required: true },
  ifcs_code: { type: String, required: true },
  branch_name: { type: String, required: true },
  bank_address: { type: String, default: "" },
  cancel_cheque_passbook: { type: String, default: null },

  // media
  profile_pic: { type: String, default: null },
  cover_pic: { type: String, default: null },

  // catalog
  vendor_bio: { type: String, default: null },
  product_category: {
    type: String,
    enum: [
      "",
      "Jewelry",
      "Electronics",
      "Garments",
      "Supermarket/FMCG",
      "Health & Beauty",
      "Home & Kitchen",
      "Books & Stationery",
      "Other",
    ],
    required: false,
    default: "",
  },
  product_category_other: { type: String, default: null },

  // legal
  address_proof: { type: String, required: true },
  termsConditions: { type: Boolean, required: true },
  privacyPolicy: { type: Boolean, required: true },
  sellerPolicy: { type: Boolean, required: true },

  role: {
    type: String,
    enum: ["seller", "cbv", "agent", "territory_head", "franchise_head"],
    required: true,
  },
  // FranchiseHead.js  (ADD inside schema)
  application_status: {
    type: String,
    enum: ["draft", "submitted", "under_review", "approved", "rejected"],
    default: "draft",
  },
  submitted_at: { type: Date, default: null },

  // linkage
  user_id: { type: ObjectId, ref: "User", default: null },

  // status
  is_active: { type: Boolean, default: false },
  is_decline: { type: Boolean, default: false },
  decline_reason: { type: String, default: null },

  // audit
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  // GST block (same as vendor)
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

  outlet_nameboard_image: { type: String, default: null }, // filename only
});

// keep the same timestamp hook
FranchiseHeadSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("FranchiseHead", FranchiseHeadSchema);
