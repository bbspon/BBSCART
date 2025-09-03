const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Reference to Product
    wishlist_id: { type: String, unique: true, default: function() { return new mongoose.Types.ObjectId().toString(); } }
}, { timestamps: true }); // Automatically manages created_at and updated_at

const Wishlist = mongoose.model("Wishlist", WishlistSchema);
module.exports = Wishlist;