// controllers/OrderController.js

const Order = require("../models/Order.js");
const Variant = require("../models/Variant.js");
const Product = require("../models/Product.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { emitCreated, emitUpdated } = require("../events/orderEmitter");
const { emitTxnUpsert } = require("../events/transactionEmitter");
const { emitCreateDeliveryJob } = require("../services/deliveryEmitter");
// Razorpay Instance
const razorpay = new Razorpay({
  key_id: "rzp_test_5kdXsZAny3KeQZ",
  key_secret: "h80tjW16ilIw9HDIBXIcEuj7",
});

/**
 * IMPORTANT:
 * Ensure the route for createOrder uses the assignment middleware:
 *   router.post('/create', authUser, requireAssignedVendor, OrderController.createOrder)
 * requireAssignedVendor must set req.assignedVendorId for the pincode/day.
 */
async function reduceStock(orderDoc) {
  if (!orderDoc || !Array.isArray(orderDoc.orderItems)) return;

  for (const line of orderDoc.orderItems) {
    const qty = Math.abs(Number(line.quantity || 1));

    if (line.variant) {
      const v = await Variant.findById(line.variant);
      if (!v) throw new Error("Variant not found for stock update");
      if ((v.stock ?? 0) < qty) throw new Error("Insufficient variant stock");
      v.stock = (v.stock ?? 0) - qty;
      await v.save();
    } else if (line.product) {
      const p = await Product.findById(line.product);
      if (!p) throw new Error("Product not found for stock update");
      if ((p.stock ?? 0) < qty) throw new Error("Insufficient product stock");
      p.stock = (p.stock ?? 0) - qty;
      await p.save();
    }
  }
}
function isValidSlot(slot) {
  if (!slot) return false;
  const hasFields =
    slot.id && slot.label && slot.start && slot.end && slot.date;
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(slot.date);
  const timeOk =
    /^\d{2}:\d{2}$/.test(slot.start) && /^\d{2}:\d{2}$/.test(slot.end);
  return !!(hasFields && dateOk && timeOk);
}
exports.createOrder = async (req, res) => {
  console.log("order user:", req.user);
  console.log(
    "order pincode:",
    req.body?.shippingAddress?.postalCode ||
      req.body?.pincode ||
      req.headers["x-delivery-pincode"] ||
      req.headers["x-pincode"]
  );
  console.log("assignedVendorId:", req.assignedVendorId);
 const allowMixedVendors =
   String(process.env.ALLOW_MIXED_VENDOR_CARTS || "false").toLowerCase() ===
   "true";
    const enforceTodaysVendor =
      String(process.env.ENFORCE_TODAYS_VENDOR || "false").toLowerCase() ===
      "true";
  // #1 Add a tiny, non-invasive validator for deliverySlot (kept local)
  function _isValidSlot(slot) {
    if (!slot) return false;
    const okId = typeof slot.id === "string" && slot.id.trim().length > 0;
    const okLabel =
      typeof slot.label === "string" && slot.label.trim().length > 0;
    const okStart =
      typeof slot.start === "string" && /^\d{2}:\d{2}$/.test(slot.start);
    const okEnd =
      typeof slot.end === "string" && /^\d{2}:\d{2}$/.test(slot.end);
    const okDate =
      typeof slot.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(slot.date);
    return okId && okLabel && okStart && okEnd && okDate;
  }

  try {
    // #2 Capture deliverySlot from checkout payload (no schema assumptions)
    const deliverySlot = req.body?.deliverySlot || req.body?.slot || null;

    const {
      orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      payment_details,
    } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order items cannot be empty" });
    }

    const user_id = req.user ? req.user.userId : null;
    if (!req.assignedVendorId) {
      return res
        .status(400)
        .json({ success: false, message: "Assigned vendor missing" });
    }

    // normalize items
    const items = orderItems.map((i) => ({
      product: i?.product || null,
      variant: i?.variant || null,
      quantity: Number(i?.quantity || 1),
      price: Number(i?.price || 0),
    }));

    // vendor check
    // vendor check (guarded by env flags)
 if (!allowMixedVendors) {
   for (const line of items) {
     let productId = line.product;
     if (!productId && line.variant) {
       const v = await Variant.findById(line.variant).select("product").lean();
       if (!v?.product) {
         return res.status(400).json({
           success: false,
           message: "Variant not linked to a product",
         });
       }
       productId = v.product;
     }
     const prod = await Product.findById(productId)
       .select("seller_id is_global")
       .lean();
     if (!prod) {
       return res
         .status(404)
         .json({ success: false, message: "Product not found" });
     }
     // enforce per-vendor only when product is not global AND we actually want the "today" rule
     if (!prod.is_global && enforceTodaysVendor) {
       if (String(prod.seller_id) !== String(req.assignedVendorId)) {
         return res.status(400).json({
           success: false,
           message:
             "Cart contains items from a different vendor than today's assignment",
         });
       }
     }
   }
 }

    // save order first (pending)
    const provisionalId =
      paymentMethod === "Razorpay"
        ? `RP_PENDING_${Date.now()}`
        : `COD_${Date.now()}`;
    const orderDoc = new Order({
      order_id: provisionalId,
      user_id,
      orderItems: items,
      total_price: Number(totalAmount || 0),
      shipping_address: shippingAddress,
      status: "pending", // enum-safe
      payment_method: paymentMethod,
      payment_details: {
        ...(payment_details || {}),
        payment_status: "pending",
        amount_paid: 0,
      },
    });
      const saved = await orderDoc.save();
      console.log("[ORDER] in", new Date().toISOString());
      require("../events/orderEmitter").emitCreated(saved).catch(() => {});

      // Send assigned order to delivery app (if configured)
      let sentToDelivery = false;
      let deliveryOrderId = null;
      let trackingId = null;
      try {
        const deliveryResult = await emitCreateDeliveryJob(saved);
        if (deliveryResult && (deliveryResult.deliveryOrderId || deliveryResult.trackingId)) {
          sentToDelivery = true;
          deliveryOrderId = deliveryResult.deliveryOrderId || null;
          trackingId = deliveryResult.trackingId || null;
          saved.deliveryOrderId = deliveryOrderId;
          saved.trackingId = trackingId;
          await saved.save();
          console.log("[ORDER] Sent to delivery app:", deliveryOrderId, trackingId);
        }
      } catch (deliveryErr) {
        console.warn("[ORDER] Delivery app send failed:", deliveryErr?.message || deliveryErr);
      }

      const orderPayload = (order) => ({
        success: true,
        message: order?.payment_method === "COD" ? "COD order placed successfully" : "Order created successfully",
        order,
        sentToDelivery,
        deliveryOrderId,
        trackingId,
      });

    if (paymentMethod === "Razorpay") {
      const options = {
        amount: Number(totalAmount || 0) * 100,
        currency: "INR",
        receipt: String(saved._id),
      };
      const rpOrder = await razorpay.orders.create(options);
      saved.order_id = rpOrder.id;
      await saved.save();

      return res.status(201).json(orderPayload(saved));
    }

    if (paymentMethod === "COD") {
      saved.payment_details.payment_status = "completed";
      saved.payment_details.amount_paid = Number(totalAmount || 0);
      await saved.save();

      require("../events/transactionEmitter").emitTxnUpsert(saved).catch(() => {});

      await reduceStock(saved);

      const freshCOD = await Order.findById(saved._id);
      return res.status(201).json(orderPayload(freshCOD || saved));
    }

    const fresh = await Order.findById(saved._id);
    return res.status(201).json(orderPayload(fresh || saved));
  } catch (error) {
    console.error("Error creating order:", error);
    // use the caught variable 'error' (was 'err' previously)
    console.log("[ORDER] ERR", new Date().toISOString(), error?.message);

    // after saving a new order
try {
  await emitCreated(savedOrder);
} catch (e) {
  console.error("[CRM] order-created failed:", e.message);
}
    console.log("[ORDER] ERR", new Date().toISOString(), error?.message);

    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: {
        statusCode: error.statusCode || 500,
        code: error.error?.code || "UNKNOWN_ERROR",
        description:
          error.error?.description || error.message || "Something went wrong",
      },
    });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const order = await Order.findOne({ order_id: razorpay_order_id });
    if (!order)
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id  + "|" +  razorpay_payment_id);
    const generated = hmac.digest("hex");

    if (generated !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    order.payment_details.payment_id = razorpay_payment_id;
    order.payment_details.payment_status = "completed";

    
// when you create a payment/transaction record (in this controller or elsewhere)
try {
  await emitTxnUpsert(savedTxn);
} catch (e) {
  console.error("[CRM] transaction-upsert failed:", e.message);
}

    order.payment_details.amount_paid = order.total_price;
    await order.save();
// right after: await order.save()
require('../events/orderEmitter').emitCreated(order).catch(() => {});

    require('../events/transactionEmitter').emitUpsert(order).catch(()=>{});

    await reduceStock(order);

    require('../events/orderEmitter').emitUpdated(order).catch(()=>{});

    return res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders with user and product details
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "name email phone")
      .populate("orderItems.product", "name price image")
      .populate("orderItems.variant", "name options")
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "name email phone")
      .populate("orderItems.product", "name price image")
      .populate("orderItems.variant", "name options");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Get order by SellerID
exports.getOrdersBySellerId = async (req, res) => {
  console.log("getOrdersBySellerId");
  try {
    const { seller_id } = req.params;
    if (!seller_id) {
      return res
        .status(400)
        .json({ success: false, message: "seller_id is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(seller_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid seller_id" });
    }
    const vendorId = new mongoose.Types.ObjectId(seller_id);

    // Find all products owned by this vendor
    const productIds = await Product.find({ seller_id: vendorId }).distinct(
      "_id"
    );

    if (!productIds.length) {
      return res.json({ success: true, orders: [] });
    }

    // Orders that include any of those products
    const orders = await Order.find({
      "orderItems.product": { $in: productIds },
    })
      .populate("user_id", "name email phone")
      .populate("orderItems.product", "name price image seller_id")
      .populate("orderItems.variant", "name options")
      .sort({ created_at: -1 });

    return res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get orders by user (most recent first). Optional query: orderIds=COD_xxx,COD_yyy to include those orders (e.g. guest orders from this browser).
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const orderIdsParam = req.query.orderIds; // comma-separated order_id values
    const extraOrderIds = orderIdsParam ? orderIdsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const query = extraOrderIds.length
      ? { $or: [{ user_id }, { order_id: { $in: extraOrderIds } }] }
      : { user_id };
    const orders = await Order.find(query)
      .populate("user_id", "name email phone")
      .populate("orderItems.product", "name price image")
      .populate("orderItems.variant", "name options")
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Sync delivery status from E-Delivery: for each BBSCART order with deliveryOrderId, if E-Delivery status is DELIVERED, set order.status = "delivered".
exports.syncDeliveryStatus = async (req, res) => {
  try {
    const BASE = process.env.DELIVERY_BASE_URL;
    const TOKEN = process.env.DELIVERY_INGEST_TOKEN;
    if (!BASE || !TOKEN) {
      return res.status(503).json({ success: false, message: "Delivery integration not configured" });
    }
    const fetch = (await import("node-fetch")).default;
    const resFetch = await fetch(`${BASE}/v1/delivery/orders`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!resFetch.ok) {
      return res.status(502).json({ success: false, message: "Failed to fetch E-Delivery orders" });
    }
    const edOrders = await resFetch.json();
    const deliveredIds = new Set();
    (Array.isArray(edOrders) ? edOrders : []).forEach((d) => {
      const id = d._id ? String(d._id) : null;
      if (id && (d.status || "").toUpperCase() === "DELIVERED") deliveredIds.add(id);
    });

    const bbOrders = await Order.find({ deliveryOrderId: { $in: Array.from(deliveredIds) }, status: { $ne: "delivered" } }).lean();
    let updated = 0;
    for (const o of bbOrders) {
      if (deliveredIds.has(String(o.deliveryOrderId))) {
        await Order.updateOne({ _id: o._id }, { $set: { status: "delivered" } });
        updated++;
      }
    }
    res.status(200).json({ success: true, updated, message: `Updated ${updated} order(s) to delivered` });
  } catch (e) {
    console.error("[syncDeliveryStatus]", e);
    res.status(500).json({ success: false, message: e.message || "Sync failed" });
  }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ status })
      .populate("user_id", "name email phone")
      .populate("orderItems.product", "name price image")
      .populate("orderItems.variant", "name options");

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Update order details (including payment details and status)
exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updated_at: Date.now() },
      { new: true }
    )
      .populate("user_id", "name email phone")
      .populate("orderItems.product", "name price image")
      .populate("orderItems.variant", "name options");

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    require('../events/orderEmitter').emitUpdated(updatedOrder).catch(()=>{});

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });

    // after updating an order
try {
  await emitUpdated(updatedOrder);
} catch (e) {
  console.error("[CRM] order-updated failed:", e.message);
}
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }

};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};
exports.markPaidTest = async (req, res) => {
  try {
    if (process.env.TEST_MODE !== "true") {
      return res
        .status(403)
        .json({ success: false, message: "Test mode disabled" });
    }
    const token = req.headers["x-test-auth"];
    if (!token || token !== process.env.TEST_AUTH_TOKEN) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid test auth" });
    }

    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.payment_details.payment_status = "completed";
    order.payment_details.amount_paid = order.total_price;
    await order.save();

    await reduceStock(order);

    return res.json({
      success: true,
      message: "Order marked paid (TEST)",
      orderId: order._id,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Test mark-paid failed" });
  }
};
