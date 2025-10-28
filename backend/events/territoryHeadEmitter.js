// backend/events/territoryHeadEmitter.js
// Upserts Territory / Territory Head data to CRM.

const { post } = require("../services/crmClient");

function buildTerritoryPayload(t) {
  return {
    territoryId: t._id?.toString() || t.territoryId || null,
    name: t.name || t.territory_name || null,
    headUserId: t.headUserId?.toString?.() || t.headUserId || null,
    region: t.region || null,
    contact: {
      phone: t.phone || t.contact?.phone || null,
      email: t.email || t.contact?.email || null,
    },
    active: typeof t.active === "boolean" ? t.active : (t.status ? t.status === "active" : true),
    meta: t.meta || null,
    createdAt: t.createdAt || t.created_at || new Date().toISOString(),
    updatedAt: t.updatedAt || t.updated_at || new Date().toISOString(),
  };
}

function keyTerritory(b) {
  const id = b.territoryId || "";
  const ts =
    (b.updatedAt && Date.parse(b.updatedAt)) ||
    (b.createdAt && Date.parse(b.createdAt)) ||
    "";
  return `territory-upsert:${id}:${ts}`;
}

async function emitTerritoryUpsert(territoryDoc) {
  const body = buildTerritoryPayload(territoryDoc);
  const key = keyTerritory(body);
  return post("/api/ingest/territory-upsert", body, key);
}

module.exports = { emitTerritoryUpsert };
