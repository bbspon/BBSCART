const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Explicitly import ObjectId from mongoose.Schema.Types
const { ObjectId } = mongoose.Schema.Types;

const TransactionSchema = new mongoose.Schema({
  order_id: ObjectId, // Associated order ID (reference to Orders collection)
  payment_method: String, // Payment method used (e.g., card, COD)
  payment_status: { type: String, default: 'success' }, // Payment status (e.g., success, failed)
  amount: Number, // Total amount paid
  created_at: { type: Date, default: Date.now }, // Transaction creation date
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
