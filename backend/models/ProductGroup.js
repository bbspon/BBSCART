// models/ProductGroup.js
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ProductGroupSchema = new mongoose.Schema(
  {
    subcategory_id: {
      type: ObjectId,
      ref: "Subcategory",
      required: true,
      index: true,
    },
    label: { type: String, required: true },
    slug: { type: String, index: true },
    // If you don’t want regex, you can leave this blank and use product_ids instead.
    // If present, we’ll filter products by name with this case-insensitive regex.
    query: { type: String }, // e.g. "toor|chana|moong"
    image: { type: String },
    priority: { type: Number, default: 100, index: true },
    active: { type: Boolean, default: true },
    // Optional: curated product IDs for a group
    product_ids: [{ type: ObjectId, ref: "Product" }],
    meta: { type: Object, default: {} },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ProductGroupSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  if (!this.slug && this.label) {
    this.slug = this.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("ProductGroup", ProductGroupSchema);
