// controllers/DeliveryWebhookController.js
const Order = require("../models/Order");

exports.statusWebhook = async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== process.env.DELIVERY_WEBHOOK_TOKEN) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const { deliveryOrderId, status, note, proofs, cod } = req.body || {};
    if (!deliveryOrderId || !status) {
      return res
        .status(400)
        .json({ error: "deliveryOrderId and status required" });
    }

    const order = await Order.findOne({ deliveryOrderId });
    if (!order) return res.status(404).json({ error: "order not found" });

    order.deliveryStatusHistory = order.deliveryStatusHistory || [];
    order.deliveryStatusHistory.push({
      code: String(status),
      note: note || "",
    });

    if (proofs?.pickup) {
      order.proofs = order.proofs || {};
      order.proofs.pickup = {
        photos: proofs.pickup.photos || [],
        signedBy: proofs.pickup.signedBy || "",
        at: proofs.pickup.at ? new Date(proofs.pickup.at) : new Date(),
      };
    }
    if (proofs?.delivery) {
      order.proofs = order.proofs || {};
      order.proofs.delivery = {
        photos: proofs.delivery.photos || [],
        signature: proofs.delivery.signature || "",
        otp: proofs.delivery.otp || "",
        at: proofs.delivery.at ? new Date(proofs.delivery.at) : new Date(),
      };
    }
    if (typeof cod?.collected === "boolean") {
      order.cod = order.cod || {};
      order.cod.collected = cod.collected;
      order.cod.collectedAt = cod.collected ? new Date() : null;
    }

    await order.save();
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[webhook] status update failed:", e.message);
    return res.status(500).json({ error: "failed" });
  }
};

exports.returnsStatus = async (req, res) => {
  try {
    // verify token
    if (
      req.headers.authorization !==
      `Bearer ${process.env.DELIVERY_WEBHOOK_TOKEN}`
    ) {
      return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    }
    const { rmaId, originalOrderId, status, trackingId } = req.body;

    await Order.updateOne(
      { _id: originalOrderId, rmaId },
      { $set: { returnStatus: status, returnTrackingId: trackingId } },
      { strict: false }
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("[webhook.returnsStatus]", e);
    res.status(500).json({ ok: false });
  }
};