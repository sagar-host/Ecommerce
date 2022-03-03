const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");
//import api feature for query= searching keyword




//create product-ADMIN ROUTE

exports.createProduct =catchAsyncError(async (req,res,next)=>{

    req.body.user = req.user.id

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
});


//create new review or update the review 

exports.createProductReview = catchAsyncError(async (req,res,next)=>{

    const {rating,comment,productId} = req.body
    const review = {
        user:req.user._id,
        name:req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);;
    
    const isReviewed = product.reviews.find(rev=>rev.user.toString()===req.user._id.toString());


    if(isReviewed){
      product.reviews.forEach(rev =>{
          if(rev=>rev.user.toString()===req.user._id.toString())

          rev.rating =rating,
          rev.comment = comment
      })

    }else{
      
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }

     
    let avg = 0;
    product.reviews.forEach(rev=>{
        avg+=rev.rating
     })
    product.ratings = avg/product.reviews.length;

    await product.save({
        validateBeforeSave: false
    });

    res.status(200).json({
        success:true,
    })


})

//get all reviews of a product 
exports.getProductReviews = catchAsyncError(async (req, res, next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("product not found",404))
    }

    res.status(200).json({
        success:true,
        reviews: product.reviews
    })
})

//delete review
exports.deleteReview = catchAsyncError(async (req, res, next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("product not found",404))
    }

    const reviews = product.reviews.filter(rev=> rev._id.toString() !== req.query.id.toString());

    let avg = 0;
      reviews.forEach((rev)=>{
        avg+=rev.rating
     })
    const ratings = avg/reviews.length;

    const numberOfReviews = reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numberOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
       
    })
})





