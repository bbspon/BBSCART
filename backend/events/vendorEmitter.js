// const { post } = require('../services/crmClient');

// async function emitUpsert(vendor) {
//   const payload = {
//     vendorId: vendor._id?.toString(),
//     name: vendor.name,
//     status: vendor.status || 'active',
//     pincodeScopes: vendor.pincodeScopes || [],
//     parent: vendor.parent || null,
//     effectiveFrom: vendor.effectiveFrom || new Date().toISOString()
//   };
//   return post('/api/ingest/vendor-upsert', payload);
// }

// module.exports = { emitUpsert };


// C:\Users\BBS\BBS\BBSCART\2025\BBSCART\backend\events\vendorEmitter.js
// const { post } = require('../services/crmClient');

// async function emitUpsert(vendor) {
//   const payload = {
//     vendorId: vendor._id?.toString(),
//     name: vendor.name || vendor.vendorName,
//     status: vendor.status || 'active',
//     pincodeScopes: vendor.pincodeScopes || vendor.pincodes || [],
//     parent: vendor.parent || null,
//     effectiveFrom: vendor.effectiveFrom || new Date().toISOString()
//   };
//   return post('/api/ingest/vendor-upsert', payload);
// }

// module.exports = { emitUpsert };


// Following are added on 2024-06-10 as updatyed code

// backend/events/vendorEmitter.js
// Upserts Vendor master data to CRM.

const { post } = require("../services/crmClient");

function buildVendorPayload(v) {
  return {
    vendorId: v._id?.toString() || v.vendorId || null,
    name: v.name || v.vendor_name || null,
    contact: {
      phone: v.phone || v.contact?.phone || null,
      email: v.email || v.contact?.email || null,
    },
    bank: v.bank || null,
    active: typeof v.active === "boolean" ? v.active : (v.status ? v.status === "active" : true),
    meta: v.meta || null,
    createdAt: v.createdAt || v.created_at || new Date().toISOString(),
    updatedAt: v.updatedAt || v.updated_at || new Date().toISOString(),
  };
}

function keyVendor(vBody) {
  const id = vBody.vendorId || "";
  const ts =
    (vBody.updatedAt && Date.parse(vBody.updatedAt)) ||
    (vBody.createdAt && Date.parse(vBody.createdAt)) ||
    "";
  return `vendor-upsert:${id}:${ts}`;
}

async function emitVendorUpsert(vendorDoc) {
  const body = buildVendorPayload(vendorDoc);
  const key = keyVendor(body);
  return post("/api/ingest/vendor-upsert", body, key);
}

module.exports = { emitVendorUpsert };
