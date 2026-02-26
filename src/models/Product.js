const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        default: '' 
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    category: { 
        type: String, 
        required: true 
    },
    stock_quantity: { 
        type: Number, 
        default: 0, 
        min: 0 
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

module.exports = mongoose.model('Product', productSchema);
