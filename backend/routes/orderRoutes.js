const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { authUser } = require("../middleware/authMiddleware");
const requireAssignedVendor = require("../middleware/requireAssignedVendor");
router.post("/", authUser, requireAssignedVendor,orderController.createOrder);
router.post("/verify-payment/", authUser, orderController.verifyPayment);
router.get("/orders/", authUser, orderController.getAllOrders);
router.get("/orders/:id", authUser, orderController.getOrderById);
router.get("/orders/seller/:seller_id", orderController.getOrdersBySellerId);
router.get(
  "/orders/user/:user_id",
  authUser,
  orderController.getOrdersBySellerId
);
router.get(
  "/orders/status/:status",
  authUser,
  orderController.getOrdersByStatus
);
router.put("/orders/:id", authUser, orderController.updateOrder);
router.delete("/orders/:id", authUser, orderController.deleteOrder);

module.exports = router;
