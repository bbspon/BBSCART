const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const User = require("../models/User");

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// CREATE: Add a new category
exports.createCategory = async (req, res) => {
    console.log('createCategory',req.body);
    try {
        const { name, description } = req.body;
        let seller_id = req.user ? req.user.userId : null;
        const newCategory = new Category({ name, description, seller_id });
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('subcategories');
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getNearbySellerCategories = async (req, res) => {
    try {        
        console.log("🟡 getNearbySellerCategories req.user:", req.user);

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }

        const user_id = req.user.userId;
        const user = await User.findById(user_id).populate("userdetails");

        if (!user || !user.userdetails) {
            return res.status(404).json({ message: "User details not found" });
        }

        const { latitude, longitude } = user.userdetails;
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "User location not available" });
        }

        // Set search radius (e.g., 5 km)
        const searchRadius = 5;

        // Fetch all sellers (users with role "seller")
        const sellers = await User.find({ role: "seller" }).populate("userdetails");

        // Filter sellers within the radius
        const nearbySellers = sellers.filter((seller) => {
            if (seller.userdetails?.latitude && seller.userdetails?.longitude) {
                const distance = haversineDistance(
                    latitude,
                    longitude,
                    seller.userdetails.latitude,
                    seller.userdetails.longitude
                );
                return distance <= searchRadius; // Only keep sellers within radius
            }
            return false;
        });

        // Extract seller IDs
        const sellerIds = nearbySellers.map((seller) => seller._id);

        // Fetch products from nearby sellers
        const categories = await Category.find({ seller_id: { $in: sellerIds } }).populate('subcategories');

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching nearby seller categories:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// READ: Get a single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('subcategories');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// READ: Get a single category by ID
exports.getCategoryBySellerId = async (req, res) => {
    try {
        const { sellerId } = req.params; 
        const category = await Category.find({ seller_id: sellerId }).populate('subcategories');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE: Update a category by ID
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;        
        let seller_id = req.user ? req.user.userId : null;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, seller_id },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(updatedCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE: Delete a category by ID
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await Subcategory.deleteMany({ category_id: category._id }); // Remove associated subcategories
        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Category and its subcategories deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};