// backend/events/cbavEmitter.js
// Upserts CBAV (Customer Become A Vendor) applications to CRM.

const { post } = require("../services/crmClient");

function buildCbavPayload(c) {
  return {
    cbavId: c._id?.toString() || c.cbavId || null,
    customerId: c.customerId?.toString?.() || c.customerId || c.userId || null,
    vendorId: c.vendorId?.toString?.() || c.vendorId || null,
    status: c.status || "pending", // pending|approved|rejected
    appliedAt: c.appliedAt || c.createdAt || new Date().toISOString(),
    approvedAt: c.approvedAt || null,
    meta: c.meta || null,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
}

function keyCbav(b) {
  const id = b.cbavId || "";
  const ts =
    (b.updatedAt && Date.parse(b.updatedAt)) ||
    (b.createdAt && Date.parse(b.createdAt)) ||
    "";
  return `cbav-upsert:${id}:${ts}`;
}

async function emitCbavUpsert(cbavDoc) {
  const body = buildCbavPayload(cbavDoc);
  const key = keyCbav(body);
  return post("/api/ingest/cbav-upsert", body, key);
}

module.exports = { emitCbavUpsert };
