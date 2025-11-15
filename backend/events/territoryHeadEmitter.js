// // backend/events/territoryHeadEmitter.js
// // Upserts Territory / Territory Head data to CRM.

// const { post } = require("../services/crmClient");

// function buildTerritoryPayload(t) {
//   return {
//     territoryId: t._id?.toString() || t.territoryId || null,
//     name: t.name || t.territory_name || null,
//     headUserId: t.headUserId?.toString?.() || t.headUserId || null,
//     region: t.region || null,
//     contact: {
//       phone: t.phone || t.contact?.phone || null,
//       email: t.email || t.contact?.email || null,
//     },
//     active: typeof t.active === "boolean" ? t.active : (t.status ? t.status === "active" : true),
//     meta: t.meta || null,
//     createdAt: t.createdAt || t.created_at || new Date().toISOString(),
//     updatedAt: t.updatedAt || t.updated_at || new Date().toISOString(),
//   };
// }

// function keyTerritory(b) {
//   const id = b.territoryId || "";
//   const ts =
//     (b.updatedAt && Date.parse(b.updatedAt)) ||
//     (b.createdAt && Date.parse(b.createdAt)) ||
//     "";
//   return `territory-upsert:${id}:${ts}`;
// }

// async function emitTerritoryUpsert(territoryDoc) {
//   const body = buildTerritoryPayload(territoryDoc);
//   const key = keyTerritory(body);
//   return post("/api/ingest/territory-upsert", body, key);
// }

// module.exports = { emitTerritoryUpsert };


// backend/events/territoryHeadEmitter.js
// Emits Territory Head upserts to CRM

const axios = require("axios");
const crm = require("../config/crm");

function buildPayload(t) {
  return {
    territoryId: t.territoryId || t._id?.toString() || null,
    name: t.name || t.territory_name || [t.vendor_fname, t.vendor_lname].filter(Boolean).join(" ").trim() || null,
    email: t.email || null,
    phone: t.phone || t.whatsappNumber || t.outlet_contact_no || null,
    platform: t.platform || "BBSCART",
    zone: t.zone || t.stateCode || null,
    stateCode: t.stateCode || null,
    bpc: t.bpc || t.businessPartnerCode || null,
    status: t.status || (t.is_active === false ? "inactive" : "active"),
    totalCustomers: Number(t.totalCustomers || 0),
    totalTransactions: Number(t.totalTransactions || 0),
    commissionEarned: Number(t.commissionEarned || 0),
    commissionPending: Number(t.commissionPending || 0),
    joinedDate: t.joinedDate || t.createdAt || t.submitted_at || new Date().toISOString(),
    links: t.links || {},
    // keep all extra BBSCART form fields so CRM can normalize
    ...t,
  };
}

async function emitTerritoryUpsert(doc) {
  const url = `${crm.baseUrl}/api/ingest/territory-upsert`;
  const headers = {
    "X-Service-Token": crm.token,
    "X-Idempotency-Key": `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    "Content-Type": "application/json",
  };
  const body = buildPayload(doc);
  const resp = await axios.post(url, body, { headers, timeout: 7000 });
  return resp.data;
}

module.exports = { emitTerritoryUpsert };
