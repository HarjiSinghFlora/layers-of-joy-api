const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('created_by', 'full_name email');
        res.json({ count: products.length, products });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('created_by', 'full_name email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock_quantity } = req.body;
        
        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock_quantity: stock_quantity || 0,
            created_by: req.userId
        });
        
        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const { name, description, price, category, stock_quantity } = req.body;
        
        product.name = name || product.name;
        product.description = description !== undefined ? description : product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity;
        
        await product.save();
        
        res.json({ message: 'Product updated', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
