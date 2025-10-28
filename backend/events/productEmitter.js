// // const { post } = require('../services/crmClient');

// // async function emitUpsert(product) {
// //   const payload = {
// //     productId: product._id?.toString(),
// //     sku: product.sku,
// //     name: product.name,
// //     vendorId: product.vendorId?.toString(),
// //     taxProfileId: product.taxProfileId,
// //     status: product.status || 'active'
// //   };
// //   return post('/api/ingest/product-upsert', payload);
// // }

// // module.exports = { emitUpsert };


// // C:\Users\BBS\BBS\BBSCART\2025\BBSCART\backend\events\productEmitter.js
// const { post } = require('../services/crmClient');

// async function emitUpsert(product) {
//   const payload = {
//     productId: product._id?.toString(),
//     sku: product.sku || product.SKU || product.skuId,
//     name: product.name || product.title,
//     vendorId: product.vendorId?.toString(),
//     taxProfileId: product.taxProfileId || product.taxGroup || 'GST',
//     status: product.status || 'active'
//   };
//   return post('/api/ingest/product-upsert', payload);
// }

// module.exports = { emitUpsert };


// Following are added on 2024-06-10 as updated code

// backend/events/productEmitter.js
// Upserts Product master data to CRM.

const { post } = require("../services/crmClient");

function buildProductPayload(p) {
  return {
    productId: p._id?.toString() || p.productId || null,
    sku: p.sku || null,
    name: p.name || p.title || null,
    taxProfileId: p.taxProfileId || null,
    mrp: Number(p.mrp || p.MRP || 0),
    price: Number(p.price || 0),
    active: typeof p.active === "boolean" ? p.active : (p.status ? p.status === "active" : true),
    meta: p.meta || null,
    createdAt: p.createdAt || p.created_at || new Date().toISOString(),
    updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
  };
}

function keyProduct(b) {
  const id = b.productId || "";
  const ts =
    (b.updatedAt && Date.parse(b.updatedAt)) ||
    (b.createdAt && Date.parse(b.createdAt)) ||
    "";
  return `product-upsert:${id}:${ts}`;
}

async function emitProductUpsert(productDoc) {
  const body = buildProductPayload(productDoc);
  const key = keyProduct(body);
  return post("/api/ingest/product-upsert", body, key);
}

module.exports = { emitProductUpsert };
