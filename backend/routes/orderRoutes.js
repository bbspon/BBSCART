const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { authUser } = require("../middleware/authMiddleware");
const requireAssignedVendor = require("../middleware/requireAssignedVendor");
router.post(
  "/",
  (req, res, next) => {
    console.log("[ORDERS] hit", new Date().toISOString());
    next();
  },
  authUser,
  requireAssignedVendor,
  orderController.createOrder
);
router.post("/verify-payment/", authUser, orderController.verifyPayment);
router.get("/", authUser, orderController.getAllOrders);
router.get("/:id", authUser, orderController.getOrderById);
router.post(
  "/:id/mark-paid-test",
  authUser,
  orderController.markPaidTest
);

router.get("/seller/:seller_id", orderController.getOrdersBySellerId);
router.get(
  "/user/:user_id",
  authUser,
  orderController.getOrdersBySellerId
);
router.get(
  "/status/:status",
  authUser,
  orderController.getOrdersByStatus
);
router.put("/:id", authUser, orderController.updateOrder);
router.delete("/:id", authUser, orderController.deleteOrder);

module.exports = router;
