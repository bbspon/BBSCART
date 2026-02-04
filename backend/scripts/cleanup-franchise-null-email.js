// Cleanup script: unset null/empty `email` fields on FranchiseHead documents
// Usage: set MONGO_URI in .env and run `node backend/scripts/cleanup-franchise-null-email.js`

const connectDB = require('../config/db');
const mongoose = require('mongoose');
const FranchiseHead = require('../models/FranchiseHead');

async function run() {
  try {
    await connectDB();
    console.log('Connected — starting cleanup of franchiseheads email field');

    // Count docs with explicit null or empty-string email
    const nullCount = await FranchiseHead.countDocuments({ email: null });
    const emptyCount = await FranchiseHead.countDocuments({ email: '' });
    console.log(`Found ${nullCount} docs with email=null and ${emptyCount} with email=''`);

    // Unset the email field on those documents so they are not indexed
    const r = await FranchiseHead.updateMany(
      { $or: [{ email: null }, { email: '' }] },
      { $unset: { email: '' } }
    );

    console.log('Update result:', r?.nModified || r?.modifiedCount || r);

    // Close connection
    await mongoose.connection.close();
    console.log('Cleanup completed — connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    try { await mongoose.connection.close(); } catch (e) {}
    process.exit(1);
  }
}

run();