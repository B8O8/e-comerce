const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({

    products: {
        type: Object
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    status: {
        type: String,
        default: 'processing'
    },
    
    total : {
        type: Number,
        default: 0
    },
    
    count: {
        type: Number,
        default: 0
    },
    
    date: {
        type: String,
        default: new Date().toISOString().split('T')[0]
    },
    
    address: {
        type: String,
    },
    
    country: {
        type: String,
    }

}, {timestamps: true});

module.exports = mongoose.model("Orders", orderSchema);