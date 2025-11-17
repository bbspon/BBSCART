// const { post } = require('../services/crmClient');

// function buildPayload(order) {
//   return {
//     orderId: order._id?.toString(),
//     orderDate: order.createdAt,
//     customerId: order.customerId?.toString(),
//     vendorId: order.vendorId?.toString(),
//     totals: {
//       subtotal: order.subtotal || 0,
//       tax: order.taxTotal || 0,
//       discount: order.discountTotal || 0,
//       grandTotal: order.grandTotal || 0,
//       currency: order.currency || 'INR',
//       escrow: !!order.escrow
//     },
//     lines: (order.items || []).map(l => ({
//       sku: l.sku,
//       productId: l.productId?.toString(),
//       qty: l.qty,
//       unitPrice: l.unitPrice,
//       taxAmount: l.taxAmount,
//       promotionId: l.promotionId || null,
//       taxProfileId: l.taxProfileId || null
//     })),
//     status: order.status || 'PLACED',
//     source: 'BBSCART'
//   };
// }

// async function emitCreated(order) {
//   return post('/api/ingest/order-created', buildPayload(order));
// }

// async function emitUpdated(order) {
//   return post('/api/ingest/order-updated', buildPayload(order));
// }

// module.exports = { emitCreated, emitUpdated };



// C:\Users\BBS\BBS\BBSCART\2025\BBSCART\backend\events\orderEmitter.js
const { post } = require('../services/crmClient');

// map your order doc -> CRM payload
function toPayload(order) {
  return {
    orderId: order._id?.toString(),
    orderDate: order.createdAt || new Date().toISOString(),
    customerId: order.customerId?.toString() || order.userId?.toString(),
    vendorId: order.vendorId?.toString(),
    totals: {
      subtotal: order.subtotal ?? order.totalBeforeTax ?? 0,
      tax: order.taxTotal ?? order.tax ?? 0,
      discount: order.discountTotal ?? order.discount ?? 0,
      grandTotal: order.grandTotal ?? order.total ?? 0,
      currency: order.currency || 'INR',
      escrow: !!order.escrow
    },
    lines: (order.items || order.products || []).map(l => ({
      sku: l.sku || l.SKU || l.skuId,
      productId: l.productId?.toString() || l.product?._id?.toString(),
      qty: l.qty ?? l.quantity ?? 1,
      unitPrice: l.unitPrice ?? l.price ?? 0,
      taxAmount: l.taxAmount ?? 0,
      taxProfileId: l.taxProfileId || l.taxGroup || 'GST',
      promotionId: l.promotionId
    })),
    status: order.status || 'PLACED',
    source: 'BBSCART'
  };
}

async function emitCreated(order) {
  return post('/api/ingest/order-created', toPayload(order));
}

async function emitUpdated(order) {
  return post('/api/ingest/order-updated', toPayload(order));
}

module.exports = { emitCreated, emitUpdated };
