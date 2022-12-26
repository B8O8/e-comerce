const User = require("../models/userModel");
const validator = require("validator");
const sendMail = require("../utils/email").sendMail;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {promisify} = require("util");
const Order = require("../models/orderModel");

const signToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN});
};

const createSendToken = (user, statusCode,res,msg) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: "success",
        msg,
        token,
        data: {
            user,
        },
    })
}
exports.signUp = async (req,res) => {
    try {
        let email = req.body.email;
        if(!validator.isEmail(email)){
            return res.status(400).json({message: "invalid email."});
        }

        const checkEmail = await User.findOne({email: req.body.email});
        if(checkEmail) {
            return res.status(409).json({message: "email already exist"});
        }

        let pass = req.body.password;
        let passConfirm = req.body.passwordConfirm;

        if(pass !== passConfirm) {
            return res.status(400).json({message: "Passwords are not the same"});
        }

     
        const newUser = await User.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
        });
        
        let msg = "user created succefully."
        createSendToken(newUser,201,res,msg);
        // return res.status(201).json({message: "user created succefully.", data: {newUser}});
        // createSendToken replace the above line;
    } catch (err) {
        res.status(400).json({message: err.message});
    }
};

exports.login = async (req,res) => {
    try {
        const user = await User.findOne({email: req.body.email});

        if (!user){
            return res.status(404).json({message: "The user does not exist"});
        }

       if(!(await user.checkPassword(req.body.password, user.password))){
        return res.status(401).json({message: "incorrect email or password"});
       }

       let msg = "you are logged in succefully !!"
        createSendToken(user,200,res,msg);
    //    return res.status(200).json({message: "you are logged in succefully !!"});
    } catch (error) {
        console.log(error);
    }
}

exports.forgotPassword = async (req,res) => {
    try {
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({message: "The user with the provider email does not exist."});
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save({validateBeforeSave:false});

        const url = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/${resetToken}`;

        const msg = `Forgot your password? Reset it by visiting the following link: ${url}`;

        try {
            await sendMail ({
                email: user.email,
                subject: "Your password reset token: (Valid for 10 min)",
                message: msg
            });

            res.status(200).json({status:"success", message: "The reset link was delivered to your email successfully"});
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({validateBeforeSave:false});
            res.status(500).json({message: "An error occured while sending the email, please try again in a moment"});
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
      const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  
      const user = await User.findOne({passwordResetToken: hashedToken,passwordResetExpires: { $gt: Date.now() },});
  
      if (!user) {
        return res.status(400).json({message: "The token is invalid, or expired. Please request a new one",});
      }
  
      if (req.body.password.length < 8) {
        return res.status(400).json({ message: "Password length is too short" });
      }
  
      if (req.body.password !== req.body.passwordConfirm) {
        return res
          .status(400)
          .json({ message: "Password & Password Confirm are not the same" });
      }
  
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangeAt = Date.now();
  
      await user.save();
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      console.log(err);
    }
  };




exports.protect = async (req, res, next) => {
    try {
        // 1: check if the token still exist
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            return res.status(401).json({message: "You are not logged in. Please login to get access"});
        }
        // 2: verify the token
        let decoded;
        try {
            decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
        } catch (error) {
            if(error.name === "JsonWebTokenError"){
                return res.status(401).json({message: "Invalid token, Login again"});
            }
            else if(error.name === "TokenExpiredError"){
                return res.status(401).json({message: "Your session token has expired!! Please login again"});
            }
        }
        // 3: check if the token owner exist
        const currentUser = await User.findById(decoded.id)
        if(!currentUser){
            res.status(401).json({message: "The user belonging to this session doesn't exist"});
        }
        // 4: check if the owner changed the password after the token was created
        if(currentUser.passChangedAfterTI(decoded.iat)){
            return res.status(401).json({message: "Your password has been changed!! Please login again"});
        }
        // 5: if evrithing ok add the user to all requestes (req.user = current user)
        req.user = currentUser;
        next();
    } catch (error) {
        console.log(error);
    }
}


exports.getUserOrders = async (req,res) => {
    const {id} = req.params;
    try {
      const user = await User.findById(id).populate('orders');
      res.status(200).json(user.orders);
    } catch (e) {
      res.status(400).send(e.message);
    }
}