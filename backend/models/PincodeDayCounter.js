// models/PincodeDayCounter.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const PincodeDayCounterSchema = new Schema(
  {
    pincode: { type: String, required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    c: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PincodeDayCounterSchema.index({ pincode: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("PincodeDayCounter", PincodeDayCounterSchema);
