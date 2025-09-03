const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { auth, authUser } = require('../middleware/authMiddleware');

router.post('/orders/', authUser, OrderController.createOrder);
router.post('/verify-payment/', authUser, OrderController.verifyPayment);
router.get('/orders/', authUser, OrderController.getAllOrders);
router.get('/orders/:id', authUser, OrderController.getOrderById);
router.get('/orders/seller/:seller_id', OrderController.getOrdersBySellerId);
router.get('/orders/user/:user_id', authUser, OrderController.getOrdersBySellerId);
router.get('/orders/status/:status', authUser, OrderController.getOrdersByStatus);
router.put('/orders/:id', authUser, OrderController.updateOrder);
router.delete('/orders/:id', authUser, OrderController.deleteOrder);

module.exports = router;
