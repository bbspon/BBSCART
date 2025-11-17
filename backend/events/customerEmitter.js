// const { post } = require('../services/crmClient');

// async function emitUpsert(user) {
//   const payload = {
//     customerId: user._id?.toString(),
//     email: user.email,
//     phone: user.phone,
//     defaultVendorToday: user.defaultVendorToday || null,
//     roleTags: user.roleTags || []
//   };
//   return post('/api/ingest/customer-upsert', payload);
// }

// module.exports = { emitUpsert };


// C:\Users\BBS\BBS\BBSCART\2025\BBSCART\backend\events\customerEmitter.js
// const { post } = require('../services/crmClient');

// async function emitUpsert(user) {
//   const payload = {
//     customerId: user._id?.toString(),
//     email: user.email,
//     phone: user.phone || user.mobile,
//     defaultVendorToday: user.defaultVendorToday || null,
//     roleTags: user.roleTags || user.roles || []
//   };
//   return post('/api/ingest/customer-upsert', payload);
// }

// module.exports = { emitUpsert };


// Following are added on 2024-06-10 as updated code

// backend/events/customerEmitter.js
// Upserts Customer master data to CRM.

const { post } = require("../services/crmClient");

function buildCustomerPayload(u) {
  const addr =
    u.address ||
    u.shipping_address || {
      line1: u.address_line1 || u.address1 || null,
      city: u.city || null,
      state: u.state || null,
      country: u.country || "India",
      pincode: u.pincode || u.postalCode || null,
    };

  return {
    customerId: u._id?.toString() || u.customerId || u.userId || null,
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || null,
    email: u.email || null,
    phone: u.phone || u.mobile || null,
    address: addr,
    active: typeof u.active === "boolean" ? u.active : (u.status ? u.status === "active" : true),
    meta: u.meta || null,
    createdAt: u.createdAt || u.created_at || new Date().toISOString(),
    updatedAt: u.updatedAt || u.updated_at || new Date().toISOString(),
  };
}

function keyCustomer(b) {
  const id = b.customerId || "";
  const ts =
    (b.updatedAt && Date.parse(b.updatedAt)) ||
    (b.createdAt && Date.parse(b.createdAt)) ||
    "";
  return `customer-upsert:${id}:${ts}`;
}

async function emitCustomerUpsert(userOrCustomerDoc) {
  const body = buildCustomerPayload(userOrCustomerDoc);
  const key = keyCustomer(body);
  return post("/api/ingest/customer-upsert", body, key);
}

module.exports = { emitCustomerUpsert };
