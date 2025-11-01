const Order = require("../models/Order");
const { createReturnPickup } = require("../services/deliveryEmitter");

exports.requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, reason, pickupAddress, pickupSlot } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const rmaId = `RMA_${Date.now()}`;
    order.returnStatus = "REQUESTED";
    order.rmaId = rmaId;
    order.returnItems = (items || []).map((x) => ({ ...x, reason }));
    order.pickupSlot = pickupSlot || null;
    await order.save();

    const payload = {
      rmaId,
      originalOrderId: String(order._id),
      orderIdMasked: order.order_id || `COD***${String(order._id).slice(-3)}`,
      customerId: String(order.user_id || ""),
      items,
      reason,
      pickupAddress,
      pickupSlot,
    };
    const resp = await createReturnPickup(payload);
    const trackingId = resp?.data?.trackingId || resp?.trackingId || null;

    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          returnTrackingId: trackingId,
          returnStatus: "PICKUP_SCHEDULED",
        },
      },
      { strict: false }
    );

    res.json({ success: true, data: { rmaId, trackingId } });
  } catch (e) {
    console.error("[requestReturn]", e);
    res.status(500).json({ success: false, message: "SERVER_ERROR" });
  }
};
