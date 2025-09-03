const mongoose = require("mongoose");
const Variant = require("./Variant");

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", default: null },
    quantity: { type: Number, default: 1 },
    cart_id: { type: String, unique: true, default: function() { return new mongoose.Types.ObjectId().toString(); } }
});

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;
