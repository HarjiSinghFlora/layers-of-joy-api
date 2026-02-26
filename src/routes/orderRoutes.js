const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getOrders,
    createOrder,
    updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

// All routes are protected
router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
