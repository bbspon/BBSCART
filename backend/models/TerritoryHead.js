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

const TerritoryHeadSchema = new mongoose.Schema({
  // personal
  vendor_fname: { type: String },
  vendor_lname: { type: String },
  dob: { type: Date },

  // bpcId is the canonical auto‑generated code.  No default so the field can
  // be omitted until assigned; sparse unique index allows multiple docs without it.
  bpcId: { type: String },

  // legacy code used `businessPartnerCode` (same value as bpcId);
  // preserve it for backwards compatibility with dashboards.
  businessPartnerCode: {
    type: String,
    unique: true,
    sparse: true,
  },

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
    default: "",
  },
  brand_name: { type: String, default: null },
  contact_person: { type: String, default: null },

  // contact
email: { type: String, trim: true, lowercase: true, default: null },
  mobile: { type: String},
  alt_mobile: { type: String, default: null },

  // addresses
  register_business_address: { type: RequiredAddressSchema },
  operational_address: { type: OptionalAddressSchema },

  // profile
  education_qualify: { type: String },
  work_experience: { type: String },

  // IDs
  aadhar_number: { type: String},
  aadhar_pic_front: { type: String, default: null },
  aadhar_pic_back: { type: String, default: null },

  self_declaration: { type: String,  },
  criminal_history: { type: String },
  referral_details: { type: String },
  lang_proficiency: { type: String },

  pan_number: { type: String },
  pan_pic: { type: String },

  // misc licenses
  gst_number: { type: String, default: "", index: true },
  gst_pic: { type: String, default: null },
  fssai_license: { type: String, default: null },
  fssai_pic: { type: String, default: null },
  shop_establish_license: { type: String, default: null },
  shop_establish_pic: { type: String, default: null },

  outlet_location: { type: OptionalAddressSchema },
  outlet_manager_name: { type: String, default: null },
  outlet_contact_no: { type: String, default: null },

  // bank
  bank_name: { type: String },
  account_holder_name: { type: String},
  account_no: { type: String },
  ifcs_code: { type: String },
  branch_name: { type: String },
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
    default: "",
  },
  product_category_other: { type: String, default: null },

  // legal
  address_proof: { type: String},
  termsConditions: { type: Boolean,},
  privacyPolicy: { type: Boolean },
  sellerPolicy: { type: Boolean },

  role: {
    type: String,
    enum: ["seller", "cbv", "agent", "territory_head", "franchise_head"],
    required: true,
  },

   // === BBS CRM/Dashboard required fields ===
   stateCode: { type: String },   // e.g. 'Puducherry'
   cityCode:  { type: String },   // e.g. 'Puducherry'
   zone:      { type: String },   // e.g. 'PY'
  phone:     { type: String },
   platform:  { type: String, default: "BBSCART" },
   totalCustomers:     { type: Number, default: 0 },
  totalTransactions:  { type: Number, default: 0 },
  commissionEarned:   { type: Number, default: 0 },
   commissionPending:  { type: Number, default: 0 },
   joinedDate:         { type: Date },


  // linkage
  user_id: { type: ObjectId, ref: "User", default: null },

  // status
  is_active: { type: Boolean, default: false },
  is_decline: { type: Boolean, default: false },
  decline_reason: { type: String, default: null },

  // audit
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  // GST block (as in Vendor/Agent)
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
  // Add inside TerritoryHeadSchema (near status flags)
  application_status: {
    type: String,
    enum: ["draft", "submitted", "under_review", "approved", "rejected"],
    default: "draft",
    index: true,
  },
  submitted_at: { type: Date, default: null },
  approved_at: { type: Date, default: null },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  decline_reason: { type: String, default: null }, // keep if already present

  outlet_nameboard_image: { type: String, default: null }, // filename only
});

// timestamp hook
TerritoryHeadSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});


// Sparse unique indexes: multiple docs can omit bpcId until assigned.
// If production still has old non-sparse bpcId_1, run once: node scripts/drop-bpcId-index.js
TerritoryHeadSchema.index({ businessPartnerCode: 1 }, { unique: true, sparse: true });
TerritoryHeadSchema.index({ bpcId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("TerritoryHead", TerritoryHeadSchema);
