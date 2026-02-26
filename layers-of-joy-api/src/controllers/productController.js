// src/controllers/productController.js
const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { category, inStock, search } = req.query;
        let query = {};

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by stock status
        if (inStock === 'true') {
            query.stock_quantity = { $gt: 0 };
        } else if (inStock === 'false') {
            query.stock_quantity = 0;
        }

        // Search by name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query)
            .populate('created_by', 'full_name email')
            .sort({ created_at: -1 });

        res.status(200).json({
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('created_by', 'full_name email');

        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }

        res.status(200).json(product);

    } catch (error) {
        console.error('Get product error:', error);
        
        // Handle invalid ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock_quantity } = req.body;

        // Validation
        if (!name || !price || !category) {
            return res.status(400).json({ 
                message: 'Please provide name, price, and category' 
            });
        }

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock_quantity: stock_quantity || 0,
            created_by: req.userId
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock_quantity } = req.body;

        // Find product
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }

        // Update fields
        product.name = name || product.name;
        product.description = description !== undefined ? description : product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity;

        await product.save();

        res.status(200).json({
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Update product error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }

        await product.deleteOne();

        res.status(200).json({ 
            message: 'Product deleted successfully' 
        });

    } catch (error) {
        console.error('Delete product error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ 
                message: 'Product not found' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};