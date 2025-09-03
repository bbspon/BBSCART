// models/Product.js
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const UiReviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 1, max: 5 },
    title: String,
    comment: String,
    reviewer: String,
    location: String,
    date: String, // display-friendly "Feb, 2021" style
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { _id: false }
);

const UiSellerSchema = new mongoose.Schema(
  {
    name: String,
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const UiRatingSummarySchema = new mongoose.Schema(
  {
    counts: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
    total: { type: Number, default: 0 },
    avg: { type: Number, min: 0, max: 5, default: 0 },
  },
  { _id: false }
);

const UiColorSchema = new mongoose.Schema(
  {
    name: String,
    img: String, // small swatch image
  },
  { _id: false }
);

const UISchema = new mongoose.Schema(
  {
    seller: UiSellerSchema,
    offers: [String],
    highlights: [String],
    colorOptions: [UiColorSchema],
    sizes: [String],
    reviews: [UiReviewSchema],
    ratingSummary: UiRatingSummarySchema,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // Core
    name: { type: String, required: true, index: true },
    description: String,

    // Legacy/base price (kept for compatibility)
    price: { type: Number },

    // Inventory
    stock: { type: Number, default: 0 },

    // Identifiers
    SKU: { type: String, unique: true, sparse: true }, // keep sparse to avoid collisions on empties

    // Brand
    brand: { type: String, index: true },

    // Shipping
    weight: { type: Number },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    // Media
    product_img: String,
    gallery_imgs: [String],

    // Taxonomy
    tags: [{ type: String }],
    category_id: { type: ObjectId, ref: "Category", required: true },
    subcategory_id: { type: ObjectId, ref: "Subcategory" },

    // Variants (by reference)
    is_variant: { type: Boolean, default: false },
    variants: [{ type: ObjectId, ref: "Variant" }],

    // Reviews (toggle)
    is_review: { type: Boolean, default: false },

    // Seller
    seller_id: { type: ObjectId, ref: "User", required: true },

    // Ratings & specs
    rating_avg: { type: Number, min: 0, max: 5, default: 0, index: true },
    rating_count: { type: Number, default: 0 },
    specs: [{ type: String }], // bullet points

    // Pricing bundle for MRP/sale/discount label
    priceInfo: {
      mrp: { type: Number, default: 0 },
      sale: { type: Number, default: 0 },
      discountText: { type: String }, // e.g., "23% off"
    },

    // Offers / flags
    exchangeOffer: { type: String },
    gstInvoice: { type: Boolean, default: false, index: true },
    deliveryIn1Day: { type: Boolean, default: false, index: true },
    assured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },

    // Attribute used in filters
    ram: { type: Number, default: 0, index: true },

    // Optional presentation data for PricingPage-style UI
    ui: UISchema,

    // Timestamps
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------- Virtuals ----------
ProductSchema.virtual("cardImage").get(function () {
  return this.product_img || (this.gallery_imgs && this.gallery_imgs[0]) || "";
});
ProductSchema.virtual("oldPrice").get(function () {
  return (this.priceInfo && this.priceInfo.mrp) || this.price || 0;
});
ProductSchema.virtual("salePrice").get(function () {
  return (this.priceInfo && this.priceInfo.sale) || this.price || 0;
});

// ---------- Indexes ----------
ProductSchema.index({ name: "text", brand: "text" });
ProductSchema.index({ "priceInfo.sale": 1 });
ProductSchema.index({ created_at: -1 });

// ---------- Hooks ----------
ProductSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
