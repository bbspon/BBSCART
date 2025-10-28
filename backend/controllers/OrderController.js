// const Order = require('../models/Order.js');
// const Variant = require('../models/Variant.js');
// const Product = require('../models/Product.js');
// const Razorpay = require("razorpay");
// const crypto = require("crypto");

// // Razorpay Instance
// const razorpay = new Razorpay({
//   key_id: 'rzp_test_5kdXsZAny3KeQZ',
//   key_secret: 'h80tjW16ilIw9HDIBXIcEuj7'
// });

// exports.createOrder = async (req, res) => {
//   console.log("createOrder Request Body:", req.user); // Debugging step
//   try {
//     const { orderItems, totalAmount, shippingAddress, paymentMethod, payment_details } = req.body;

//     console.log("Request Body:", req.body); // Debugging step

//     if (!orderItems || orderItems.length === 0) {
//       return res.status(400).json({ success: false, message: "Order items cannot be empty" });
//     }

//     const user_id = req.user ? req.user.userId : null;

//     console.log("user_id:", user_id);

//     // Format order items
//     const formattedOrderItems = orderItems.map(item => ({
//       product: item?.product || null,
//       variant: item?.variant || null,
//       quantity: item?.quantity || 1,
//       price: item?.price || 0,
//     }));

//     // Update stock for each order item
//     for (const item of formattedOrderItems) {
//       if (item.variant) {
//         const variant = await Variant.findById(item.variant);
//         if (!variant) {
//           return res.status(400).json({ success: false, message: "Variant not found" });
//         }
//         if (variant.stock < item.quantity) {
//           return res.status(400).json({ success: false, message: "Insufficient stock for variant" });
//         }
//         variant.stock -= item.quantity;
//         await variant.save();
//       } else {
//         const product = await Product.findById(item.product);
//         if (!product) {
//           return res.status(400).json({ success: false, message: "Product not found" });
//         }
//         if (product.stock < item.quantity) {
//           return res.status(400).json({ success: false, message: "Insufficient stock for product" });
//         }
//         product.stock -= item.quantity;
//         await product.save();
//       }
//     }

//     const options = {
//       amount: totalAmount * 100, // Convert to paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`
//     };

//     console.log("Creating Razorpay order with options:", options); // Debugging log

//     const order = await razorpay.orders.create(options);

//     console.log("Razorpay order created successfully:", order); // Debugging log

//     // Create new order in DB
//     const newOrder = new Order({
//       order_id: order.id,
//       user_id,
//       orderItems: formattedOrderItems,
//       total_price: totalAmount,
//       shipping_address: shippingAddress,
//       status: 'pending',
//       payment_method: paymentMethod,
//       payment_details,
//     });

//     const savedOrder = await newOrder.save();
//     res.status(201).json({ success: true, message: 'Order created successfully', order: savedOrder });

//   } catch (error) {
//     console.error("Error creating order:", error); // Full error object

//     if (error.statusCode) {
//       console.error("Error Status Code:", error.statusCode);
//     }
//     if (error.error) {
//       console.error("Error Code:", error.error.code);
//       console.error("Error Description:", error.error.description);
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Error creating order',
//       error: {
//         statusCode: error.statusCode || 500,
//         code: error.error?.code || "UNKNOWN_ERROR",
//         description: error.error?.description || error.message || "Something went wrong"
//       }
//     });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   try {
//       const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//       const order = await Order.findOne({ order_id: razorpay_order_id });

//       if (!order) {
//           return res.status(400).json({ success: false, message: "Order not found" });
//       }

//       const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//       hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//       const generatedSignature = hmac.digest("hex");

//       if (generatedSignature === razorpay_signature) {
//           order.payment_details.payment_id = razorpay_payment_id;
//           order.payment_details.payment_status = "completed";
//           await order.save();
//           res.json({ success: true, message: "Payment successful" });
//       } else {
//           res.status(400).json({ success: false, message: "Invalid signature" });
//       }
//   } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//   }
// }

// // Get all orders with user and product details
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("user_id", "name email phone") // ✅ Populate user details
//       .populate("orderItems.product", "name price image") // ✅ Populate product details
//       .populate("orderItems.variant", "name options") // ✅ Populate variant details (if exists)
//       .sort({ created_at: -1 });

//     res.status(200).json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching orders",
//       error: error.message
//     });
//   }
// };

// // Get order by ID
// exports.getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate("user_id", "name email phone")
//       .populate("orderItems.product", "name price image")
//       .populate("orderItems.variant", "name options");

//     if (!order) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }
//     res.status(200).json({ success: true, order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
//   }
// };

// // Get order by SellerID
// exports.getOrdersBySellerId = async (req, res) => {
//   console.log('getOrdersBySellerId');
//   try {
//     const { seller_id } = req.params;

//     // Find orders where any order item belongs to the given seller
//     const orders = await Order.find({
//       'orderItems.product': { $in: await Product.find({ seller_id }).distinct('_id') }
//     })
//       .populate("user_id", "name email phone")
//       .populate({
//         path: "orderItems.product",
//         select: "name price image",
//         populate: { path: "seller_id", select: "name" }
//       })
//       .populate("orderItems.variant", "name options");

//     if (!orders.length) {
//       return res.status(404).json({ success: false, message: 'No orders found for this seller' });
//     }

//     res.status(200).json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
//   }
// };

// // Get orders by status
// exports.getOrdersByUserId = async (req, res) => {
//   try {
//     const { user_id } = req.params;
//     const orders = await Order.find({ user_id })
//       .populate("user_id", "name email phone")
//       .populate("orderItems.product", "name price image")
//       .populate("orderItems.variant", "name options");

//     res.status(200).json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
//   }
// };

// // Get orders by status
// exports.getOrdersByStatus = async (req, res) => {
//   try {
//     const { status } = req.params;
//     const orders = await Order.find({ status })
//       .populate("user_id", "name email phone")
//       .populate("orderItems.product", "name price image")
//       .populate("orderItems.variant", "name options");

//     res.status(200).json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
//   }
// };

// // Update order details (including payment details and status)
// exports.updateOrder = async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body, updated_at: Date.now() },
//       { new: true }
//     ).populate("user_id", "name email phone")
//       .populate("orderItems.product", "name price image")
//       .populate("orderItems.variant", "name options");

//     if (!updatedOrder) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }

//     res.status(200).json({ success: true, message: 'Order updated successfully', order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
//   }
// };

// // Delete order
// exports.deleteOrder = async (req, res) => {
//   try {
//     const deletedOrder = await Order.findByIdAndDelete(req.params.id);
//     if (!deletedOrder) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }

//     res.status(200).json({ success: true, message: 'Order deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
//   }
// };

// controllers/OrderController.js

const Order = require("../models/Order.js");
const Variant = require("../models/Variant.js");
const Product = require("../models/Product.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { emitCreated, emitUpdated } = require("../events/orderEmitter");
const { emitTxnUpsert } = require("../events/transactionEmitter");
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

  try {
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
    for (const line of items) {
      let productId = line.product;
      if (!productId && line.variant) {
        const v = await Variant.findById(line.variant).select("product").lean();
        if (!v?.product)
          return res
            .status(400)
            .json({
              success: false,
              message: "Variant not linked to a product",
            });
        productId = v.product;
      }
      const prod = await Product.findById(productId)
        .select("seller_id is_global")
        .lean();
      if (!prod)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      if (
        !prod.is_global &&
        String(prod.seller_id) !== String(req.assignedVendorId)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Cart contains items from a different vendor than today's assignment",
          });
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
      require('../events/orderEmitter').emitCreated(saved).catch(()=>{});

    if (paymentMethod === "Razorpay") {
      const options = {
        amount: Number(totalAmount || 0) * 100,
        currency: "INR",
        receipt: String(saved._id),
      };
      const rpOrder = await razorpay.orders.create(options);
      saved.order_id = rpOrder.id;
      await saved.save();

      return res
        .status(201)
        .json({
          success: true,
          message: "Order created successfully",
          order: saved,
        });

    }
console.log("[ORDER] out OK", new Date().toISOString());
// NOTE: previous code tried to emitCreated(order) but `order` was undefined here.
// We already emitted the created event just after the DB save above — avoid duplicate emit.
    if (paymentMethod === "COD") {
      saved.payment_details.payment_status = "completed";
      saved.payment_details.amount_paid = Number(totalAmount || 0);
      await saved.save();

      require('../events/transactionEmitter').emitUpsert(saved).catch(()=>{});

      await reduceStock(saved);

      return res.status(201).json({
        success: true,
        message: "COD order placed successfully",
        order: saved,
      });
    }

    return res
      .status(201)
      .json({
        success: true,
        message: "Order created successfully",
        order: saved,
      });
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
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
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
  return res.status(400).json({ success: false, message: "Invalid seller_id" });
}
const vendorId = new mongoose.Types.ObjectId(seller_id);

// Find all products owned by this vendor
const productIds = await Product.find({ seller_id: vendorId }).distinct("_id");

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

// Get orders by user
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.find({ user_id })
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
