// models/Transaction.js
const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    orderId: { type: String, index: true },
    transactionId: { type: String, index: true, unique: true, sparse: true },

    platform: { type: String, index: true }, // BBSCART / Thiaworld / Golddex
    buyerName: { type: String },
    buyerPhone: { type: String },

    sellerName: { type: String },
    sellerRole: { type: String, index: true }, // Agent / Vendor / Franchisee / CBAV etc.

    productTitles: [{ type: String }],
    totalQuantity: { type: Number, default: 0 },

    isGSTApplicable: { type: Boolean, default: false },
    gstType: { type: String }, // CGST_SGST / IGST
    cgstPercentage: { type: Number, default: 0 },
    sgstPercentage: { type: Number, default: 0 },
    igstPercentage: { type: Number, default: 0 },

    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalGSTAmount: { type: Number, default: 0 },

    amount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    commissionApplied: { type: Number, default: 0 },

    paymentStatus: { type: String, index: true }, // paid / failed / escrow
    orderStatus: { type: String, index: true }, // delivered / returned / cancelled etc.
    paymentMethod: { type: String, index: true }, // COD / UPI / Razorpay / Wallet / Netbanking
    payoutStatus: { type: String, index: true }, // paid / pending / on-hold

    status: { type: String, index: true }, // success etc.

    date: { type: Date, index: true }, // main transaction date
  },
  { timestamps: true, collection: "transactions" }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
