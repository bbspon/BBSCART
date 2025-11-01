const mongoose = require('mongoose');

// Explicitly import ObjectId from mongoose.Schema.Types
const { ObjectId } = mongoose.Schema.Types;

const DeliverySlotSchema = new mongoose.Schema(
  {
    id: String, // "AM"
    label: String, // "Morning 9–12"
    start: String, // "09:00"
    end: String, // "12:00"
    date: String, // "YYYY-MM-DD"
  },
  { _id: false }
);
const ReturnSlotSchema = new mongoose.Schema(
  {
    id: String,
    label: String,
    start: String,
    end: String,
    date: String,
  },
  { _id: false }
);

const ReturnItemSchema = new mongoose.Schema(
  {
    orderItemId: String,
    sku: String,
    qty: Number,
    reason: String,
  },
  { _id: false }
);
const OrderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true }, // Unique identifier for the order
  user_id: { type: ObjectId, ref: "User", required: false }, // Reference to Users collection
  orderItems: [
    {
      product: { type: ObjectId, ref: "Product", required: true }, // Reference to Products collection
      quantity: { type: Number, required: true }, // Quantity of the product ordered
      price: { type: Number, required: true }, // Price of the product
      variant: { type: ObjectId, ref: "Variant", required: false }, // Optional variant reference
    },
  ], // List of ordered items
  total_price: { type: Number, required: true }, // Total price of the order
  shipping_address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  }, // Shipping address for the order
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "shipped", "delivered", "canceled"],
  }, // Order status
  payment_method: { type: String, required: true }, // Payment method (e.g., card, COD)
  returnStatus: { type: String, default: null }, // "REQUESTED","PICKUP_SCHEDULED","PICKED","CANCELLED","FAILED","REFUNDED"
  returnTrackingId: { type:String, default:null },
  rmaId: { type:String, default: null },
  returnItems: { type:[ReturnItemSchema], default: [] },
  pickupSlot: { type: ReturnSlotSchema, default: null },
  payment_details: {
    payment_id: { type: String, required: false }, // Unique payment identifier (e.g., Razorpay, PayPal ID)
    transaction_id: { type: String, required: false }, // Transaction ID
    amount_paid: { type: Number, required: false }, // Amount paid by user
    payment_status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed", "failed", "refunded"],
    }, // Payment status
  },
  // --- Delivery integration fields ---
  trackingId: { type: String }, // NEW

  deliveryOrderId: { type: String }, // from E-Delivery
  deliveryStatusHistory: [
    {
      code: { type: String, required: true }, // e.g., CREATED, PICKED_UP, DELIVERED
      note: { type: String, default: "" },
      at: { type: Date, default: Date.now },
    },
  ],
  proofs: {
    pickup: {
      photos: [{ type: String }],
      signedBy: { type: String },
      at: { type: Date },
    },
    delivery: {
      photos: [{ type: String }],
      signature: { type: String },
      otp: { type: String },
      at: { type: Date },
    },
  },
  cod: {
    isCOD: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    collected: { type: Boolean, default: false },
    collectedAt: { type: Date },
  },
  created_at: { type: Date, default: Date.now }, // Order creation date
  updated_at: { type: Date, default: Date.now }, // Last updated date
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;