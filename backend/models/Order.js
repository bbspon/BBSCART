const mongoose = require("mongoose");

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
      // Support both formats (controller-safe)
      productId: ObjectId,
      product: ObjectId,

      name: String,
      variant: { type: ObjectId, ref: "Variant", required: false }, // Optional variant reference

      qty: Number,
      quantity: Number,

      price: Number, // unit price (for your flow this is typically INCLUSIVE)

      // ✅ GST Snapshot (Amazon style)
      hsnCode: String,
      gstRate: Number,
      isTaxInclusive: Boolean,

      unitBase: Number,
      unitTax: Number,

      cgst: Number,
      sgst: Number,
      igst: Number,

      lineBase: Number,
      lineTax: Number,
      lineTotal: Number,

      vendorId: ObjectId,
      seller_id: ObjectId,

      supplyType: String,

      // Optional vendor meta (safe add; doesn’t break existing)
      sellerName: { type: String, default: "" },
      sellerGSTIN: { type: String, default: "" },
      sellerState: { type: String, default: "" },
    },
  ],

  total_price: { type: Number, required: true }, // Total price of the order (grand total)

  // ✅ Invoice fields (NEW, non-breaking)
  invoice: {
    invoiceNumber: { type: String, default: "" }, // e.g., INV-2026-000001
    invoiceDate: { type: Date, default: null },
    isGenerated: { type: Boolean, default: false },

    // Optional storage for PDF
    pdfPath: { type: String, default: "" }, // server path or public url
    pdfUrl: { type: String, default: "" }, // if you store public link
  },

  // ✅ Totals snapshot for GST reporting (NEW, non-breaking)
  totals: {
    taxableTotal: { type: Number, default: 0 }, // sum(lineBase)
    gstTotal: { type: Number, default: 0 }, // sum(lineTax)
    cgstTotal: { type: Number, default: 0 },
    sgstTotal: { type: Number, default: 0 },
    igstTotal: { type: Number, default: 0 },

    shippingTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },

    grandTotal: { type: Number, default: 0 }, // should match total_price
    amountInWords: { type: String, default: "" }, // optional
  },

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
  returnTrackingId: { type: String, default: null },
  rmaId: { type: String, default: null },
  returnItems: { type: [ReturnItemSchema], default: [] },
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

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;