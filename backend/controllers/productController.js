const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
//import api feature for query= searching keyword




//create product-ADMIN ROUTE

exports.createProduct =catchAsyncError(async (req,res,next)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
        //then export to route
    })
})

//get all products after creating products


exports.getAllProducts = catchAsyncError(async (req,res)=>{

    const resultPerPage =5;
    //below is a mongo db function
    const productCount = await Product.countDocuments();

   const apiFeature = new ApiFeatures(Product.find(),req.query)
   .search()
   .filter().pagination(resultPerPage)
    const products =await apiFeature.query;
    res.status(200).json({
        success:true,
        products,
    })
})

//Get single products details

exports.getProductDetails =catchAsyncError(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("product not found",404))
    }

    res.status(200).json({
        success:true,
        product,
        productCount
    })
})


//update product -- Admin

exports.updateProduct =catchAsyncError(async (req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("product not found",404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
    new:true, 
    runValidators:true,
    useFindAndModify:false}
        );
        res.status(200).json({
            success:true,
            product
        })
})

//Delete Product -- Admin

exports.deleteProduct = catchAsyncError(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("product not found",404))
    }

    await product.remove();
    res.status(200).json({
        success:true,
        message:"product deleted successfully"
    })
})

