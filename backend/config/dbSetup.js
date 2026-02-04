const mongoose = require('mongoose');
const User = require('../models/User'); // Path to your User model
const Product = require('../models/Product'); // Path to your Product model
const Order = require('../models/Order'); // Path to your Order model
const Transaction = require('../models/Transaction'); // Path to your Transaction model
const FranchiseHead = require('../models/FranchiseHead'); // Franchise Head model

async function createIndexes() {
  try {
    await User.collection.createIndex({ email: 1 }, { unique: true }); // Unique email index for users

    // Create a partial unique index for franchise head emails to ignore null/empty values
    await FranchiseHead.collection.createIndex(
      { email: 1 },
      {
        unique: true,
        partialFilterExpression: { email: { $exists: true, $type: 'string', $ne: '' } },
      }
    );

    await Product.collection.createIndex({ category: 1 }); // Index for product category
    await Order.collection.createIndex({ user_id: 1 }); // Index for orders by user
    await Transaction.collection.createIndex({ order_id: 1 }); // Index for transactions by order
    console.log('Indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

module.exports = createIndexes;
