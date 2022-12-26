const Order = require("../models/orderModel");
const User = require("../models/userModel");

exports.createOrder = async (req,res) => {
    const orderOwner = await User.findById(req.body.owner);
    
    try{
        if(!orderOwner){
            return res.status(400).json({message: "An order, must belong to a user"});
        }

        const newOrder = await Order.create({
            owner: req.body.owner,
            products: req.body.products,
            country: req.body.country,
            address: req.body.address, 
        });

        return res.status(201).json({message: "Order created succefully", data: newOrder});
    }catch (error) {
        res.status(400).json({message: error.message});
    }
};


exports.getOrders = async(req, res)=> {
    try {
      const orders = await Order.find();
      if(!orders){
        return res.status(400).json({message: "there are no orders yet"})
      }
      return res.status(200).json({data: orders});
    } catch(error){
        res.status(400).json({message: error.message});
    }
};