const Product = require("../models/productModel");



//create product-ADMIN ROUTE

exports.createProduct = async (req,res,next)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
        //then export to route
    })
}

//get all products after creating products


exports.getAllProducts = async (req,res)=>{
    const products =await Product.find();
    res.status(200).json({
        success:true,
        products
    })
}

//Get single products details

exports.getProductDetails = async (req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
        })
    }

    res.status(200).json({
        success:true,
        product
    })
}


//update product -- Admin

exports.updateProduct = async (req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found!"
        })
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
}

//Delete Product -- Admin

exports.deleteProduct = async (req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found!"
        })
    }

    await product.remove();
    res.status(200).json({
        success:true,
        message:"product deleted successfully"
    })
}

