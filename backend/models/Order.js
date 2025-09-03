const mongoose = require('mongoose');

// Explicitly import ObjectId from mongoose.Schema.Types
const { ObjectId } = mongoose.Schema.Types;

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true }, // Unique identifier for the order
  user_id: { type: ObjectId, ref: 'User', required: true }, // Reference to Users collection
  orderItems: [
    {
      product: { type: ObjectId, ref: 'Product', required: true }, // Reference to Products collection
      quantity: { type: Number, required: true }, // Quantity of the product ordered
      price: { type: Number, required: true }, // Price of the product
      variant: { type: ObjectId, ref: 'Variant', required: false }, // Optional variant reference
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
  status: { type: String, default: 'pending', enum: ['pending', 'shipped', 'delivered', 'canceled'] }, // Order status
  payment_method: { type: String, required: true }, // Payment method (e.g., card, COD)

  payment_details: {
    payment_id: { type: String, required: false }, // Unique payment identifier (e.g., Razorpay, PayPal ID)
    transaction_id: { type: String, required: false }, // Transaction ID
    amount_paid: { type: Number, required: false }, // Amount paid by user
    payment_status: { type: String, default: 'pending', enum: ['pending', 'completed', 'failed', 'refunded'] }, // Payment status
  },

  created_at: { type: Date, default: Date.now }, // Order creation date
  updated_at: { type: Date, default: Date.now }, // Last updated date
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;