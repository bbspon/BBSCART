// backend/events/agentEmitter.js
// Upserts Agent master data to CRM.

const { post } = require("../services/crmClient");

function buildAgentPayload(a) {
  return {
    agentId: a._id?.toString() || a.agentId || null,
    name: a.name || a.fullname || null,
    franchiseId: a.franchiseId?.toString?.() || a.franchiseId || null,
    territoryId: a.territoryId?.toString?.() || a.territoryId || null,
    contact: {
      phone: a.phone || a.contact?.phone || null,
      email: a.email || a.contact?.email || null,
    },
    active: typeof a.active === "boolean" ? a.active : (a.status ? a.status === "active" : true),
    meta: a.meta || null,
    createdAt: a.createdAt || a.created_at || new Date().toISOString(),
    updatedAt: a.updatedAt || a.updated_at || new Date().toISOString(),
  };
}

function keyAgent(b) {
  const id = b.agentId || "";
  const ts =
    (b.updatedAt && Date.parse(b.updatedAt)) ||
    (b.createdAt && Date.parse(b.createdAt)) ||
    "";
  return `agent-upsert:${id}:${ts}`;
}

async function emitAgentUpsert(agentDoc) {
  const body = buildAgentPayload(agentDoc);
  const key = keyAgent(body);
  return post("/api/ingest/agent-upsert", body, key);
}

module.exports = { emitAgentUpsert };
