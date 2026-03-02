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
// ✅ GST helpers (Amazon-style snapshot)
function round2(n) {
  const x = Number(n || 0);
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

function calcInclusive(price, rate) {
  const p = Number(price || 0);
  const r = Number(rate || 0);
  if (!r) return { base: round2(p), tax: 0 };
  const base = (p * 100) / (100 + r);
  const tax = p - base;
  return { base: round2(base), tax: round2(tax) };
}

function splitGST(tax, sellerState, buyerState) {
  const t = round2(tax);
  if (!sellerState || !buyerState) {
    return { cgst: 0, sgst: 0, igst: 0, supplyType: "unknown" };
  }
  if (String(sellerState).toLowerCase() === String(buyerState).toLowerCase()) {
    return { cgst: round2(t / 2), sgst: round2(t / 2), igst: 0, supplyType: "intra" };
  }
  return { cgst: 0, sgst: 0, igst: t, supplyType: "inter" };
}

function pickState(addr) {
  // best-effort: adapt to your existing address shape without breaking anything
  return (
    addr?.state ||
    addr?.stateName ||
    addr?.province ||
    addr?.region ||
    addr?.state_code ||
    addr?.stateCode ||
    null
  );
}
const razorpay = new Razorpay({
  key_id: "rzp_test_5kdXsZAny3KeQZ",
  key_secret: "h80tjW16ilIw9HDIBXIcEuj7",
});
// ✅ Invoice number generator
function generateInvoiceNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `INV-${yyyy}${mm}${dd}-${rand}`;
}

// ✅ Convert number to words (simple INR version)
function numberToWords(num) {
  return `${num} Rupees Only`;
}

// ✅ Compute totals snapshot from orderItems
function computeTotals(orderItems) {
  let taxableTotal = 0;
  let gstTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  for (const item of orderItems) {
    taxableTotal += Number(item.lineBase || 0);
    gstTotal += Number(item.lineTax || 0);
    cgstTotal += Number(item.cgst || 0);
    sgstTotal += Number(item.sgst || 0);
    igstTotal += Number(item.igst || 0);
  }

  taxableTotal = round2(taxableTotal);
  gstTotal = round2(gstTotal);
  cgstTotal = round2(cgstTotal);
  sgstTotal = round2(sgstTotal);
  igstTotal = round2(igstTotal);

  return {
    taxableTotal,
    gstTotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
  };
}
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
// ✅ AMAZON-STYLE TAX SNAPSHOT (ADD-ONLY, no logic removed)
const buyerState = pickState(shippingAddress);

// Try to load Vendor model if it exists (optional, won't crash if missing)
let Vendor = null;
try {
  Vendor = require("../models/Vendor.js");
} catch (e) {
  Vendor = null;
}

for (const line of items) {
  // Resolve productId (variant → product)
  let productId = line.product;

  if (!productId && line.variant) {
    const v = await Variant.findById(line.variant).select("product").lean();
    if (v?.product) productId = v.product;
  }

  if (!productId) continue;

  // Pull GST fields from PRODUCT (Amazon style)
  const prod = await Product.findById(productId)
    .select("hsnCode gstRate isTaxInclusive seller_id is_global")
    .lean();

  // If product not found, keep your existing flow (it already handles not found elsewhere)
  if (!prod) continue;

  const gstRate = Number(prod.gstRate ?? 0);
  const hsnCode = (prod.hsnCode || "").toString().trim();
  const isTaxInclusive = prod.isTaxInclusive !== false; // default true

  // Seller resolution (marketplace)
  const sellerId = prod.seller_id || req.assignedVendorId || null;

  // Calculate base/tax from INCLUSIVE price (MRP style)
  const unitPrice = Number(line.price || 0);
  const qty = Number(line.quantity || 1);

  const { base: unitBase, tax: unitTax } = isTaxInclusive
    ? calcInclusive(unitPrice, gstRate)
    : { base: round2(unitPrice), tax: round2((unitPrice * gstRate) / 100) };

  const lineBase = round2(unitBase * qty);
  const lineTax = round2(unitTax * qty);
  const lineTotal = round2(unitPrice * qty);

  // Try to split CGST/SGST/IGST (best effort)
let sellerState = null;

// CASE 1: Marketplace vendor product
if (Vendor && sellerId && prod.seller_id) {
  const vdoc = await Vendor.findById(sellerId)
    .select("state stateCode")
    .lean();

  sellerState = vdoc?.state || vdoc?.stateCode || null;
}

// CASE 2: Global / Platform-owned product
if (!sellerState && prod.is_global) {
  sellerState = "Tamil Nadu"; // 🔴 Set your actual platform state
}
  const split = splitGST(lineTax, sellerState, buyerState);

  // Attach snapshot fields (this is the Amazon-style core)
  line.hsnCode = hsnCode;
  line.gstRate = gstRate;
  line.isTaxInclusive = isTaxInclusive;

  line.unitBase = unitBase;
  line.unitTax = unitTax;

  line.lineBase = lineBase;
  line.lineTax = lineTax;
  line.lineTotal = lineTotal;

  line.cgst = split.cgst;
  line.sgst = split.sgst;
  line.igst = split.igst;
  line.supplyType = split.supplyType;
  

  line.seller_id = sellerId; // keeps seller on each order item
}
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

          const returnedAdmin = deliveryResult.adminId || null;
          if (returnedAdmin) {
            console.log(`[ORDER] Delivery app assigned adminId=${returnedAdmin} for order ${saved.order_id}`);
          } else {
            console.warn(`[ORDER] Delivery app did NOT assign admin for order ${saved.order_id}; it will not show on admin assigned orders page until admin mapping exists.`);
          }
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

  // ✅ Generate invoice snapshot
  const totals = computeTotals(saved.orderItems);

  saved.invoice = {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    isGenerated: true,
  };

  saved.totals = {
    ...totals,
    shippingTotal: 0,
    discountTotal: 0,
    grandTotal: saved.total_price,
    amountInWords: numberToWords(saved.total_price),
  };

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
    // ✅ Generate invoice snapshot after successful payment
const totals = computeTotals(order.orderItems);

order.invoice = {
  invoiceNumber: generateInvoiceNumber(),
  invoiceDate: new Date(),
  isGenerated: true,
};

order.totals = {
  ...totals,
  shippingTotal: 0,
  discountTotal: 0,
  grandTotal: order.total_price,
  amountInWords: numberToWords(order.total_price),
};
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
// ✅ Get Invoice Data
exports.getInvoiceByOrderId = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "name email phone")
      .populate("orderItems.product", "name SKU");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.invoice?.isGenerated) {
      return res.status(400).json({
        success: false,
        message: "Invoice not generated yet",
      });
    }

    return res.status(200).json({
      success: true,
      invoice: {
        invoiceNumber: order.invoice.invoiceNumber,
        invoiceDate: order.invoice.invoiceDate,
        orderId: order.order_id,
        paymentId: order.payment_details?.payment_id,
        buyer: {
          name: order.user_id?.name,
          email: order.user_id?.email,
          phone: order.user_id?.phone,
          address: order.shipping_address,
        },
        items: order.orderItems,
        totals: order.totals,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};