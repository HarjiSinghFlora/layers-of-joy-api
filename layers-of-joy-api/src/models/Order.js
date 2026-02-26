// src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price_at_time: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    }
});

const orderSchema = new mongoose.Schema({
    customer_name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        minlength: [2, 'Customer name must be at least 2 characters long']
    },
    customer_email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    items: [orderItemSchema],
    total_amount: {
        type: Number,
        default: 0,
        min: [0, 'Total amount cannot be negative']
    },
    notes: {
        type: String,
        maxlength: [300, 'Notes cannot exceed 300 characters']
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

// Calculate total before saving
orderSchema.pre('save', async function(next) {
    if (this.isModified('items')) {
        this.total_amount = this.items.reduce((total, item) => {
            return total + (item.price_at_time * item.quantity);
        }, 0);
    }
    next();
});

// Method to check if order can be modified
orderSchema.methods.canModify = function() {
    return ['pending', 'processing'].includes(this.status);
};

module.exports = mongoose.model('Order', orderSchema);