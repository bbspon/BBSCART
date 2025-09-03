const mongoose = require("mongoose");

const GrocerySchema = new mongoose.Schema(
  {
    // Card basics
    name: { type: String, required: true, index: true },
    brand: { type: String, index: true },
    form: { type: String, index: true }, // Powder, Granules, Vegetable, Mixture, etc.
    weight: { type: String }, // "1.3 kg", "500 g"

    // Media
    image: { type: String },

    // Ratings
    rating_avg: { type: Number, min: 0, max: 5, default: 0, index: true },
    rating_count: { type: Number, default: 0 },

    // Pricing
    priceInfo: {
      mrp: { type: Number, default: 0 },
      sale: { type: Number, default: 0 },
    },

    // Flags
    assured: { type: Boolean, default: false },
    freeDelivery: { type: Boolean, default: false, index: true },
    inStock: { type: Boolean, default: true, index: true },

    // Labels
    offers: [{ type: String }], // ["Special Price", "Buy More, Save More", "Limited Deal"]
    tags: [{ type: String }],

    // Ownership (optional)
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

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

// Virtuals shaped exactly for the Grocery.jsx UI
GrocerySchema.virtual("rating").get(function () {
  return this.rating_avg;
});
GrocerySchema.virtual("reviews").get(function () {
  return this.rating_count;
});
GrocerySchema.virtual("price").get(function () {
  return this.priceInfo?.sale || 0;
});
GrocerySchema.virtual("oldPrice").get(function () {
  return this.priceInfo?.mrp || 0;
});
GrocerySchema.virtual("discountPct").get(function () {
  const mrp = this.priceInfo?.mrp || 0;
  const sale = this.priceInfo?.sale || 0;
  if (!mrp || mrp <= 0) return 0;
  return Math.max(0, Math.round(((mrp - sale) / mrp) * 100));
});

// Indexes for search and filters
GrocerySchema.index({
  name: "text",
  brand: "text",
  form: "text",
  offers: "text",
});
GrocerySchema.index({ "priceInfo.sale": 1 });
GrocerySchema.index({ created_at: -1 });

// Keep updated_at fresh
GrocerySchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Grocery", GrocerySchema);
