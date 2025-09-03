const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log("Received Data:", req.body);

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

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if the product is already in the wishlist
        const existingWishlistItem = await Wishlist.findOne({ user: userId, product: productId });

        if (existingWishlistItem) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }

        // Create a new wishlist entry
        let wishlist = new Wishlist({
            user: userId,
            product: productId,
            wishlist_id: new mongoose.Types.ObjectId().toString(),
        });

        // Save the wishlist entry
        await wishlist.save();

        // // Populate product details after saving
        // wishlist = await Wishlist.findById(wishlist._id)
        // .populate({
        //     path: 'product',
        //     populate: [
        //         { path: 'category_id' },
        //         { path: 'subcategory_id' },
        //         { path: 'variants' }
        //     ]
        // });

        res.status(201).json({ message: "Product added to wishlist", wishlist });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Error adding to wishlist", error });
    }
};

exports.getWishlist = async (req, res) => {
    console.log('getWishlist');
    try {
        let userId = req.user ? req.user.userId : null;

        if (!userId) {
            if (!req.session.userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
            userId = req.session.userId;
        }

        // Fetch all wishlist entries for the user
        let wishlist = await Wishlist.find({ user: userId })
            .populate({
                path: 'product',
                populate: [
                    { path: 'category_id' }, // Populate category details
                    { path: 'subcategory_id' }, // Populate subcategory details
                    { path: 'variants' } // Populate variants if available
                ]
            });

        if (!wishlist.length) {
            return res.status(404).json({ message: "Wishlist is empty" });
        }

        console.log('wishlist', wishlist);
        res.status(200).json(wishlist);
    } catch (error) {
        console.error("Error retrieving wishlist:", error);
        res.status(500).json({ message: "Error retrieving wishlist", error });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('removeFromWishlist', req.params);

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        let userId = req.user ? req.user.userId : req.session.userId;

        if (!userId) {
            return res.status(400).json({ message: "No user or session found" });
        }

        // Find and delete the wishlist entry
        let deletedItem = await Wishlist.findOneAndDelete({ user: userId, product: productId });

        if (!deletedItem) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }

        res.status(200).json({ message: "Product removed from wishlist" });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ message: "Error removing from wishlist", error });
    }
};