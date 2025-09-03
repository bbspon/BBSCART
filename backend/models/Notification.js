// models/Notification.js
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["vendor_application"], required: true },
  vendorId: { type: ObjectId, ref: "Vendor", required: true },
  title: { type: String, default: "New Vendor Application" },
  message: { type: String, default: "" },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
