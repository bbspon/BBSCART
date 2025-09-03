const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

// ✅ Get all cart items for a user
exports.getCartItems = async (req, res) => {
  try {
    let userId = req.user ? req.user.userId : req.session.userId;

    if (!userId) {
      return res.status(400).json({ message: "No user or session found" });
    }

    const cartItems = await Cart.find({ user: userId }).populate(
      "product variant"
    );
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Error fetching cart items", error });
  }
};

// ✅ Add a product to the cart (Supports variantId)
exports.addToCart = async (req, res) => {
  try {
    console.log("addToCart", req.body);
    const { productId, variantId = null, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let userId = req.user ? req.user.userId : null;

    if (!userId) {
      if (!req.session.userId) {
        req.session.userId = new mongoose.Types.ObjectId().toString();
      }
      userId = req.session.userId;
    }

    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (String(prod.vendorId) !== String(req.assignedVendorId)) {
      return res
        .status(400)
        .json({
          message: "Item not allowed from a different vendor for today",
        });
    }
    let cartItem = await Cart.findOne({
      user: userId,
      product: productId,
      variant: variantId,
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        user: userId,
        product: productId,
        variant: variantId || null,
        quantity,
        cart_id: new mongoose.Types.ObjectId().toString(),
      });

      console.log("Saving Cart Item:", cartItem);
      await cartItem.save();
    }

    res.status(201).json({ message: "Added to cart", cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart", error });
  }
};

// ✅ Update cart item quantity (Supports variantId)
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, variantId = null, quantity } = req.body;
    let userId = req.user ? req.user.userId : req.session.userId;

    if (!userId) {
      return res.status(400).json({ message: "No user or session found" });
    }

    let cartItem = await Cart.findOne({
      user: userId,
      product: productId,
      variant: variantId,
    });

    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Quantity updated", cartItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating quantity", error });
  }
};

// ✅ Remove a product from the cart (Supports variantId)
exports.removeFromCart = async (req, res) => {
  try {
    console.log("removeFromCart Params:", req.params); // Debugging
    console.log("removeFromCart Body:", req.body); // Debugging

    const { productId } = req.params; // Get productId from URL params
    const { variantId = null } = req.body; // Get variantId from request body
    let userId = req.user ? req.user.userId : req.session.userId;

    if (!userId) {
      return res.status(400).json({ message: "No user or session found" });
    }

    const query = { user: userId, product: productId };
    if (variantId) query.variant = variantId;

    await Cart.findOneAndDelete(query);

    res.status(200).json({ message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error });
  }
};

// ✅ Clear the entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    await Cart.deleteMany({ user: userId });

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error });
  }
};
