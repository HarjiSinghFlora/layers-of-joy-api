// src/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { customer_name, customer_email, items, notes } = req.body;

        // Validation
        if (!customer_name || !items || items.length === 0) {
            return res.status(400).json({ 
                message: 'Please provide customer name and order items' 
            });
        }

        // Process each item
        const processedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            // Check if product exists and has sufficient stock
            const product = await Product.findById(item.product_id).session(session);
            
            if (!product) {
                throw new Error(`Product with id ${item.product_id} not found`);
            }

            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`);
            }

            // Deduct stock
            product.stock_quantity -= item.quantity;
            await product.save({ session });

            // Add to processed items
            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                price_at_time: product.price
            });

            totalAmount += product.price * item.quantity;
        }

        // Create order
        const order = await Order.create([{
            customer_name,
            customer_email,
            items: processedItems,
            total_amount: totalAmount,
            notes,
            created_by: req.userId
        }], { session });

        // Commit transaction
        await session.commitTransaction();

        // Populate product details for response
        const populatedOrder = await Order.findById(order[0]._id)
            .populate('items.product', 'name price')
            .populate('created_by', 'full_name');

        res.status(201).json({
            message: 'Order created successfully',
            order: populatedOrder
        });

    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        
        console.error('Create order error:', error);
        
        res.status(400).json({ 
            message: error.message || 'Error creating order',
            error: error.message 
        });

    } finally {
        session.endSession();
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        let query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.created_at = {};
            if (startDate) {
                query.created_at.$gte = new Date(startDate);
            }
            if (endDate) {
                query.created_at.$lte = new Date(endDate);
            }
        }

        const orders = await Order.find(query)
            .populate('items.product', 'name price')
            .populate('created_by', 'full_name')
            .sort({ created_at: -1 });

        // Calculate summary statistics
        const summary = {
            total_orders: orders.length,
            total_revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
            by_status: {
                pending: orders.filter(o => o.status === 'pending').length,
                processing: orders.filter(o => o.status === 'processing').length,
                completed: orders.filter(o => o.status === 'completed').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length
            }
        };

        res.status(200).json({
            summary,
            orders
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name price description')
            .populate('created_by', 'full_name email');

        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }

        res.status(200).json(order);

    } catch (error) {
        console.error('Get order error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status value' 
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }

        // If cancelling order, restore stock
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock_quantity: item.quantity } },
                        { session }
                    );
                }

                order.status = status;
                await order.save({ session });
                await session.commitTransaction();

            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } else {
            order.status = status;
            await order.save();
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        console.error('Update order status error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ 
                message: 'Order not found' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
};