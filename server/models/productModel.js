const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, "enter the name of product"]
      },
    description: {
        type: String,
        required: [true, "define the product"]
      },
    price: {
        type: String,
        required: [true, "enter the price"]
      },
    quantity: {
        type: String,
        required: [true, "enter the quantity"]
      },

    image: {
        type: String,
        required: true
      }

},{timestamps: true});

module.exports = mongoose.model("Products", productSchema);