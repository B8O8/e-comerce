const Product = require("../models/productModel");
const User = require("../models/userModel");

exports.createProduct = async (req,res) => {
    try {

        const newProduct = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.body.image,
        });

        return res.status(201).json({message: "Product created successfully", data: newProduct});
    } catch (error) {
        console.log(error);
    }
};


exports.getProduct = async (req,res) => {
    try {
        const product = await Product.find();
        res.status(200).json({data: product});

    } catch (error) {
        res.status(404).json({ message: error.message });
        
    };
};


exports.updateProduct = async (req, res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message: "id not found"})
    }
    try {
        
        const updatedProduct = await Product.findByIdAndUpdate(id,{
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.body.image,
        });

        return res.status(201).json({message: "Product updated successfully", data: updatedProduct});

    }catch (error) {
        res.status(400).json({ message: error.message});
    }
};

exports.deleteProduct = async (req, res) => {
    const {id} = req.params;
    try {
      await Product.findByIdAndDelete(id);
      res.status(200).json({message: "Product deleted successully"});
    } catch (error) {
      res.status(400).send(error.message);
    }
  }

exports.addToCart = async (req,res) => {
    const userId = req.body.userId;
    const productId = req.body.productId;
    const price = req.bdy.price;

    try {
        const user = await User.findById(userId);
        const userCart = User.create;
        if(user.cart[productId]){
            userCart[productId] += 1;
        } else {
            userCart[productId] = 1;
        }
        userCart.count += 1;
        userCart.total = Number(userCart.total) + Number(price);
        user.cart = userCart;
        user.markModified('cart');
        await user.save();
        return res.status(200).json({message: "added to cart successfully"});
    } catch (error) {
        return res.status(400).send(error.message);
    }
}


exports.removeFromCart = async (req,res) => {
    const userId = req.body.userId;
    const productId = req.body.productId;
    const price = req.bdy.price;
    try {
        const user = await User.findById(userId);
        const userCart = user.cart;
        userCart.total -= Number(userCart[productId]) * Number(price);
        userCart.count -= userCart[productId];
        delete userCart[productId];
        user.cart = userCart;
        user.markModified('cart');
        await user.save();
        return res.status(200).json(user);
      } catch (e) {
        return res.status(400).send(e.message);
      }
}