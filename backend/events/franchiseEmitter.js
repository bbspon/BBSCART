// backend/events/franchiseEmitter.js
// Upserts Franchise master data to CRM.

const { post } = require("../services/crmClient");

function buildFrPayload(f) {
  return {
    franchiseId: f._id?.toString() || f.franchiseId || null,
    name: f.name || f.franchise_name || null,
    territoryId: f.territoryId?.toString?.() || f.territoryId || null,
    ownerUserId: f.ownerUserId?.toString?.() || f.ownerUserId || null,
    contact: {
      phone: f.phone || f.contact?.phone || null,
      email: f.email || f.contact?.email || null,
    },
    active: typeof f.active === "boolean" ? f.active : (f.status ? f.status === "active" : true),
    meta: f.meta || null,
    createdAt: f.createdAt || f.created_at || new Date().toISOString(),
    updatedAt: f.updatedAt || f.updated_at || new Date().toISOString(),
  };
}

function keyFranchise(b) {
  const id = b.franchiseId || "";
  const ts =
    (b.updatedAt && Date.parse(b.updatedAt)) ||
    (b.createdAt && Date.parse(b.createdAt)) ||
    "";
  return `franchise-upsert:${id}:${ts}`;
}

async function emitFranchiseUpsert(frDoc) {
  const body = buildFrPayload(frDoc);
  const key = keyFranchise(body);
  return post("/api/ingest/franchise-upsert", body, key);
}

module.exports = { emitFranchiseUpsert };
