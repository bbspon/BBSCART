const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authUser } = require('../middleware/authMiddleware');
const requireAssignedVendor = require("../middleware/requireAssignedVendor");

router.get("/",authUser,cartController.getCartItems);
router.post("/add", authUser, requireAssignedVendor,cartController.addToCart);
router.put("/update",authUser,cartController.updateQuantity);
router.delete("/remove/:productId",authUser,cartController.removeFromCart);
router.delete("/clear",authUser,cartController.clearCart);

module.exports = router;
