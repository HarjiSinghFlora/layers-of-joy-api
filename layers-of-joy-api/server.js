// server.js

console.log('🚀 Starting server...');
console.log('Current directory:', process.cwd());

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express(); // ✅ Create app only once

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json()); // ✅ REQUIRED to read req.body

// ===============================
// Import Routes
// ===============================
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

// ===============================
// Connect to MongoDB
// ===============================
console.log('📡 Connecting to MongoDB...');

mongoose.connect('mongodb://localhost:27017/layers_of_joy_db')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// ===============================
// Routes
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: '🍰 Layers Of Joy Bakery API',
        endpoints: {
            test: 'GET /test',
            auth: 'POST /api/auth/register, POST /api/auth/login',
            products: 'GET /api/products, POST /api/products',
            orders: 'GET /api/orders, POST /api/orders'
        }
    });
});

// ===============================
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Test: http://localhost:${PORT}/test`);
});