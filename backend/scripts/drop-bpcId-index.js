/**
 * One-time fix for production: E11000 duplicate key on bpcId: null
 *
 * If production has an old non-sparse unique index on bpcId, only one document
 * can have bpcId: null. Run this once to drop that index; on next app start,
 * TerritoryHead.syncIndexes() will create the correct sparse unique index.
 *
 * Usage (from backend folder, with MONGO_URI set):
 *   node scripts/drop-bpcId-index.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Set MONGO_URI or MONGODB_URI");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const coll = db.collection("territoryheads");
  const indexes = await coll.indexes();
  const hasBpcId = indexes.some((i) => i.name === "bpcId_1");
  if (hasBpcId) {
    await coll.dropIndex("bpcId_1");
    console.log("Dropped index bpcId_1. Restart the app so syncIndexes() creates the sparse one.");
  } else {
    console.log("Index bpcId_1 not found (already dropped or sparse). No action needed.");
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
