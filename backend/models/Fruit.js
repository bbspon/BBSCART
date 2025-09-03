const mongoose = require("mongoose");

const FruitSchema = new mongoose.Schema(
  {
    // Card fields used by your UI
    name: { type: String, required: true, index: true },
    variety: { type: String },
    weight: { type: String }, // "300-350 g"
    color: { type: String },
    taste: { type: String },
    origin: { type: String },

    image: { type: String },

    // Ratings
    rating_avg: { type: Number, min: 0, max: 5, default: 0, index: true },
    rating_count: { type: Number, default: 0 },

    // Pricing (per kg)
    priceInfo: {
      mrp: { type: Number, default: 0 }, // oldPricePerKg
      sale: { type: Number, default: 0 }, // pricePerKg
      discountText: { type: String }, // optional label like "13% off"
    },

    // Misc/flags
    seasonalOffer: { type: String },
    organic: { type: Boolean, default: false },
    deliveryIn1Day: { type: Boolean, default: false, index: true },
    bestseller: { type: Boolean, default: false },

    // Bullet list (shown in UI)
    specs: [{ type: String }],

    // For “Newest”
    addedAt: { type: Date, default: Date.now },

    // Owner (optional)
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Timestamps (manual, to match your other models)
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals mapped exactly to the frontend names
FruitSchema.virtual("rating").get(function () {
  return this.rating_avg;
});
FruitSchema.virtual("reviewsText").get(function () {
  const n = this.rating_count || 0;
  // keep your “12,300 Ratings & 850 Reviews” look if you later store reviews count
  return `${n.toLocaleString()} Ratings${n ? " & " : ""}${this._reviews_count || ""} Reviews`.trim();
});
FruitSchema.virtual("pricePerKg").get(function () {
  return this.priceInfo?.sale || 0;
});
FruitSchema.virtual("oldPricePerKg").get(function () {
  return this.priceInfo?.mrp || 0;
});

// Indexes for search/sort
FruitSchema.index({ name: "text", variety: "text", origin: "text" });
FruitSchema.index({ "priceInfo.sale": 1 });
FruitSchema.index({ addedAt: -1 });

FruitSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Fruit", FruitSchema);
