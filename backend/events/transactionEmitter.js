// const { post } = require('../services/crmClient');

// async function emitUpsert(txn) {
//   const payload = {
//     orderId: txn.orderId?.toString(),
//     txnId: txn._id?.toString(),
//     method: txn.method,
//     amount: txn.amount,
//     status: txn.status,
//     capturedAt: txn.capturedAt,
//     escrow: txn.escrow ? { enabled: true, reason: txn.escrow.reason || '' } : { enabled: false }
//   };
//   return post('/api/ingest/transaction-upsert', payload);
// }

// module.exports = { emitUpsert };


// // C:\Users\BBS\BBS\BBSCART\2025\BBSCART\backend\events\transactionEmitter.js
// const { post } = require('../services/crmClient');

// async function emitUpsert(txn) {
//   const payload = {
//     txnId: txn._id?.toString(),
//     orderId: txn.orderId?.toString() || txn.order?._id?.toString(),
//     method: txn.method || txn.paymentMethod,
//     amount: txn.amount ?? txn.paidAmount ?? 0,
//     status: txn.status || 'created',
//     capturedAt: txn.capturedAt || txn.createdAt || new Date().toISOString(),
//     escrow: txn.escrow ? { enabled: true, holdReason: txn.escrow.reason || '' } : { enabled: false }
//   };
//   return post('/api/ingest/transaction-upsert', payload);
// }

// module.exports = { emitUpsert };


// Following are added on 2024-06-10 as updated code

// backend/events/transactionEmitter.js
// Emits transaction-upsert (payments, settlements, refunds) to CRM.

const { post } = require("../services/crmClient");

function buildTxnPayload(txn) {
  return {
    transactionId: txn._id?.toString() || txn.transactionId || txn.txnId || null,
    orderId: txn.orderId?.toString?.() || txn.orderId || null,

    vendorId: txn.vendorId?.toString?.() || txn.vendorId || null,
    agentId: txn.agentId?.toString?.() || txn.agentId || null,
    franchiseId: txn.franchiseId?.toString?.() || txn.franchiseId || null,

    amount: Number(txn.amount || 0),
    currency: txn.currency || "INR",
    method: txn.method || null,       // e.g. razorpay, card, cod_settlement
    status: txn.status || null,       // success|failed|refunded
    gateway: txn.gateway || null,     // razorpay|stripe|cod
    reference: txn.reference || txn.payment_id || null,

    meta: txn.meta || null,

    occurredAt: txn.occurredAt || txn.capturedAt || txn.updatedAt || new Date().toISOString(),
    source: "BBSCART",
  };
}

function keyTxn(b) {
  const id = b.transactionId || b.reference || "";
  const ts = (b.occurredAt && Date.parse(b.occurredAt)) || "";
  return `transaction-upsert:${id}:${ts}`;
}

async function emitTxnUpsert(txnDoc) {
  const body = buildTxnPayload(txnDoc);
  const key = keyTxn(body);
  return post("/api/ingest/transaction-upsert", body, key);
}

module.exports = { emitTxnUpsert };
