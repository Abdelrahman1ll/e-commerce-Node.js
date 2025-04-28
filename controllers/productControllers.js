const asyncHandler = require("express-async-handler");
const { Product,ValidationCreateProduct,ValidationUpdateProduct } = require("../models/Product");
const {Category} = require("../models/category");
const {Brand} = require("../models/brand");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/ApiFeatures");
const {deleteOne,getOne} = require("./handlerFactory");
const fs = require('fs').promises;
const path = require('path');
/**
 * @desc   Get Products
 * @route   /api/product
 * @method  GET
 * @access  Public
**/
// من الاقل الى الاعلى  /api/products?sort=price
// من الاعلى الى الاقل  /api/products?sort=-price
// من الاقل الى الاعلى بي القيمة من العميل /api/product?price[gte]=100&price[lte]=500

const getProducts = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(Product.find(), req.query).filter().sort();
  const products = await features.query;

  if (!products.length) {
    return next(new ApiError("No products found", 404));
  }
  res.status(200).send({
    amount: products.length,
     data: { products },
     status: 'success' 
    });
});

/**
 * @desc   Get Product By ID
 * @route   /api/product/:id
 * @method  GET
 * @access  Public
**/
const getProductById = getOne(Product);

/**
 * @desc   Create Product
 * @route   /api/product
 * @method  POST
 * @access  Private
**/
const createProduct = asyncHandler(async (req, res, next) => {
  const {image,images,...productData } = req.body;

  if(!images || images.length === 0 || !image || image.length === 0){
    return next(new ApiError("Please upload at least one image", 400));
  }

  const { error } = await ValidationCreateProduct(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

const cat = await Category.findById(req.body.Category);
  if (!cat) {
    return next(new ApiError("Category not found", 404));
  }
  const brandId = await Brand.findById(req.body.brand);
  if (!brandId) {
    return next(new ApiError("Brand not found", 404));
  }
  
  const product = await new Product({
    ...productData,
    images,
    image,
    brand:brandId._id,
    Category:cat._id,
  });
  const createProduct = await product.save();
  
  res.status(201).send({
    data: { createProduct },
    status: 'success'
    });
});

/**
 * @desc   Update Product
 * @route   /api/product/:id
 * @method  PUT
 * @access  Private
**/
const updateProduct = asyncHandler(async (req, res, next) => {
  const {image,images,...productData } = req.body;
  const productId = req.params.id;

  const { error } = await ValidationUpdateProduct(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const ProductExists = await Product.findById(productId);
  if (!ProductExists) {
    return next(new ApiError("Product not found", 404));
  }
  let cat;
  if(req.body.Category){
     cat = await Category.findById(req.body.Category);
    if (!cat) {
      return next(new ApiError("Category not found", 404));
    }
  }
  let brandId;
  if(req.body.brand){
     brandId = await Brand.findById(req.body.brand);
  if (!brandId) {
    return next(new ApiError("Brand not found", 404));
  
  }
  }
  
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      ...productData,
      images,
      image,
      brand:brandId?._id,
      Category:cat?._id
    },
    { new: true , runValidators: true}
  );
  
  res.status(201).send({
    data: { product },
    status: 'success'
    });
});

/**
 * @desc   Delete Product
 * @route   /api/product/:id
 * @method  DELETE
 * @access  Private
**/





module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
};
