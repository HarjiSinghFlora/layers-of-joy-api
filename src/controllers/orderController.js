const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.product', 'name price')
            .populate('created_by', 'full_name');
        res.json({ count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create order
// @route   POST /api/orders
const createOrder = async (req, res) => {
    try {
        const { customer_name, items } = req.body;
        
        // Process items and calculate total
        let totalAmount = 0;
        const processedItems = [];
        
        for (const item of items) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found: ' + item.product_id });
            }
            
            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    message: 'Insufficient stock for ' + product.name 
                });
            }
            
            // Deduct stock
            product.stock_quantity -= item.quantity;
            await product.save();
            
            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                price_at_time: product.price
            });
            
            totalAmount += product.price * item.quantity;
        }
        
        // Create order
        const order = await Order.create({
            customer_name,
            items: processedItems,
            total_amount: totalAmount,
            created_by: req.userId
        });
        
        res.status(201).json({ message: 'Order created', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = status;
        await order.save();
        
        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getOrders,
    createOrder,
    updateOrderStatus
};
