// services/deliveryEmitter.js
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const User = require("../models/User");
const BASE = process.env.DELIVERY_BASE_URL; // http://localhost:5000/api/assigned-orders
const TOKEN = process.env.DELIVERY_INGEST_TOKEN;

async function getUserNamePhone(userId) {
  try {
    if (!userId) return { name: "", phone: "" };
    const u = await User.findById(userId, {
      name: 1,
      phone: 1,
      mobile: 1,
      firstName: 1,
      lastName: 1,
    });
    if (!u) return { name: "", phone: "" };
    const name =
      [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name || "";
    const phone = u.phone || u.mobile || "";
    return { name, phone };
  } catch {
    return { name: "", phone: "" };
  }
}

function countryToISO(country) {
  if (!country) return "IN";
  const s = String(country).toLowerCase();
  if (s.startsWith("ind")) return "IN";
  return country.length === 2 ? country.toUpperCase() : "IN";
}

async function mapOrderToDeliveryPayload(orderDoc) {
  const addr = orderDoc?.shipping_address || {};
  const items = Array.isArray(orderDoc?.orderItems) ? orderDoc.orderItems : [];

  const { name, phone } = await getUserNamePhone(orderDoc.user_id);

  return {
    orderId: orderDoc.order_id, // idempotency link
    items: items.map((line) => ({
      sku: String(line.product || line.variant || ""), // use product ObjectId as SKU token
      qty: Number(line.quantity || 1),
      price: Number(line.price || 0),
    })),
    destination: {
      name,
      phone,
      address1: addr.street || "",
      address2: "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.postalCode || "",
      country: countryToISO(addr.country || "IN"),
    },
    cod: {
      isCOD: String(orderDoc.payment_method || "").toUpperCase() === "COD",
      amount: Number(orderDoc.total_price || 0),
    },
  };
}
async function createReturnPickup(payload) {
  try {
    const res = await axios.post(`${BASE}/v1/returns`, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "X-Idempotency-Key": `rma-${payload.rmaId}`,
      },
      timeout: 15000,
    });
    return res.data;
  } catch (e) {
    console.error(
      "[deliveryEmitter.createReturnPickup]",
      e?.response?.data || e.message
    );
    return { ok: false, error: "DELIVERY_EMIT_FAILED" };
  }
}
async function emitCreateDeliveryJob(orderDoc) {
  if (!BASE || !TOKEN) {
    console.error("[deliveryEmitter] BASE/TOKEN missing in env");
    return null;
  }

  const payload = await mapOrderToDeliveryPayload(orderDoc);
  const res = await fetch(`${BASE}/v1/delivery/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      "X-Idempotency-Key": orderDoc.order_id, // stable id
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Delivery ingest failed: ${res.status} ${text}`);
  }

  // Augment the original response with convenience fields.
  // Keeps backward compatibility (original json is still returned).
const json = await res.json(); // { ok, data: {...} } OR legacy flat
const d = json?.data && typeof json.data === "object" ? json.data : json;

const deliveryOrderId = d?._id ?? d?.id ?? d?.deliveryOrderId ?? null;

const trackingId =
  d?.trackingId ??
  d?.trackingID ??
  d?.tracking_id ??
  d?.trackId ??
  d?.trackID ??
  null;

if (!deliveryOrderId || !trackingId) {
  console.warn(
    "[deliveryEmitter] missing fields in response:",
    JSON.stringify(json)
  );
}

return { ...json, deliveryOrderId, trackingId };
}

module.exports = { emitCreateDeliveryJob, createReturnPickup };
