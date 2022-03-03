const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto")


//Register a User
exports.registerUser =catchAsyncError(async(req,res,next)=>{
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"This is a sample id",
            url:"profilepicurl"
        }
    });
    
    sendToken(user, 201, res)
});


//login user
exports.loginUser = catchAsyncError (async (req, res, next) => {
    const { email, password } = req.body;

    //checking if user has given password and email both

    if(!email || !password){
        return next(new ErrorHandler("Please Enter email & password", 400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);


    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401));
    }

 sendToken(user, 200, res)
    

})

//logout user 

exports.logout = catchAsyncError(async(req,res,next)=>{

    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success:true,
        message: "LOGGEG OUT ",
    })
})


//forgot password

exports.forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("user not found", 404))
    }
    //get reset password token

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    //link to forgot password

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}` ;

    const message = `Your password reset token is :-  \n\n ${resetPasswordUrl} \n\nIf you have not requested this email 
    then , please ignore it`;

    try{

        await sendEmail({
            email:user.email,
            subject:`Ecommerce paswword Recovery`,
            message,

        });
        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email} successfully`,
        })

    } catch (error) {
        user.resetPasswordToken =  undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));

    }

});


//Reset PASSWORD

exports.resetPassword = catchAsyncError(async(req,res,next)=>{

    //creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now() },
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not matched", 400))

    }

    user.password = req.body.password;
    user.resetPasswordToken =  undefined;
    user.resetPasswordExpire = undefined;


    await user.save();

    sendToken(user,200, res)


})

//get user detail- whom login currently

exports.getUserDetails = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
})


//Update user password

exports.updatePassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);


    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect",400));
    }
 
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));

    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
})


//Update user Profile

exports.updateProfile = catchAsyncError(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }
//we will add cloudinary later

const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
    new:true,
    runValidators: true,
    useFindAndModify: false,
})
  
res.status(200).json({
    success: true,
})
})

//get all user from admin

exports.getAllUser = catchAsyncError(async(req,res,next)=>{

    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    })
})


//get all user for accesss from admin route

exports.getSingleUser = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){

        return  next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user,
    })

})

//admin can update any user role
//Update user Profile

exports.updateUserRole = catchAsyncError(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }


const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
    new:true,
    runValidators: true,
    useFindAndModify: false,
})
  
res.status(200).json({
    success: true,
})
})


//admin - delete any user
//delete user

exports.deleteUser = catchAsyncError(async(req,res,next)=>{

  const user = await User.findById(req.params.id); 
//we will remove cloudinary later

if(!user){
    return next(new ErrorHandler(`user does not exist with id: ${req.params.id}`))
}

await user.remove();


res.status(200).json({
    success: true,
    message: "User deleted successfully"
})
})


