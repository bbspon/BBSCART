const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String }, // optional
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String }, // optional title/heading
    message: { type: String, required: true }, // <- map from "comment"
    rating: { type: Number, min: 1, max: 5, required: true },
    verified: { type: Boolean, default: false }, // optional
    media: [{ type: String }], // optional (urls/paths if you add uploads later)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
