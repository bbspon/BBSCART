const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/authMiddleware');

// Mock data for dashboard
const getDashboardMetrics = () => {
    return {
        products: 100,
        orders: 50,
        revenue: 1200.50
    };
};

// Route for fetching dashboard data
router.get('/dashboard', adminOnly, (req, res) => {
    try {
        const metrics = getDashboardMetrics();
        res.status(200).json(metrics); // Send metrics as response
    } catch (err) {
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
});

// Add more routes for managing products, orders, etc.
router.get('/products', adminOnly, (req, res) => {
    const products = [
        { id: 1, name: 'Product 1', price: 50 },
        { id: 2, name: 'Product 2', price: 30 },
    ];
    res.status(200).json(products);
});

router.get('/orders', adminOnly, (req, res) => {
    const orders = [
        { orderId: 1, user: 'John Doe', total: 100 },
        { orderId: 2, user: 'Jane Doe', total: 200 },
    ];
    res.status(200).json(orders);
});

module.exports = router;