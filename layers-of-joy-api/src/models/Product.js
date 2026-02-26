// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters long']
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        set: v => parseFloat(v).toFixed(2) // Ensure 2 decimal places
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Cakes', 'Cookies', 'Breads', 'Pastries', 'Muffins', 'Other']
    },
    stock_quantity: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: { 
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
});

// Virtual for checking if product is in stock
productSchema.virtual('in_stock').get(function() {
    return this.stock_quantity > 0;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);