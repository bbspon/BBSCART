const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');

// Dashboard Metrics
exports.getMetrics = async (req, res, next) => {
    try {
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        const userCount = await User.countDocuments();
        const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]);

        res.json({
            products: productCount,
            orders: orderCount,
            users: userCount,
            revenue: totalRevenue[0]?.total || 0,
        });
    } catch (error) {
        next(error);
    }
};

// Product Management
exports.manageProduct = {
    add: async (req, res, next) => {
        try {
            const product = new Product(req.body);
            await product.save();
            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(product);
        } catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await Product.findByIdAndDelete(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
};