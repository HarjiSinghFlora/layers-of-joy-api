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
        min: 1 
    },
    price_at_time: { 
        type: Number, 
        required: true 
    }
});

const orderSchema = new mongoose.Schema({
    customer_name: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    items: [orderItemSchema],
    total_amount: { 
        type: Number, 
        default: 0 
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

module.exports = mongoose.model('Order', orderSchema);
