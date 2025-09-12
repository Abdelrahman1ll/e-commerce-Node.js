const asyncHandler = require("express-async-handler");
const {
  ValidationCreateProduct,
  ValidationUpdateProduct,
  Product,
} = require("../models/Product_Model");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/ApiFeatures");
const { Category } = require("../models/Category_Model");
const { Brand } = require("../models/Brand_Model");
/**
 * @desc   Get Products
 * @route   /api/product
 * @method  GET
 * @access  Public
 **/
// من الاقل الى الاعلى  /api/products?sort=price
// من الاعلى الى الاقل  /api/products?sort=-price
// من الاقل الى الاعلى بي القيمة من العميل /api/products?price[gte]=100&price[lte]=500
// /api/products?brand=125738638
// /api/products?category=926252682
// /api/products?title=abdo

const getProducts = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(Product.find(), req.query).filter().sort();
  const products = await features.query;

  res.status(200).send({
    amount: products.length,
    data: { products },
    status: "success",
  });
});

/**
 * @desc   Get Product By ID
 * @route   /api/products/:id
 * @method  GET
 * @access  Public
 **/
const getProductById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const data = await Product.findById(id);
  if (!data) {
   return next(new ApiError("Product not found", 404));
  }
  res.status(200).send({
    data,
    status: "success",
  });
});

/**
 * @desc   Create Product
 * @route   /api/products
 * @method  POST
 * @access  Private
 **/
const createProduct = asyncHandler(async (req, res, next) => {
  let { images, ...productData } = req.body;
  if (!images || images.length === 0) {
   return next(new ApiError("Please upload at least one image", 400));
  }

  const { error } = ValidationCreateProduct({images, ...productData});
  if (error) return res.status(400).json({ error: error.details[0].message });

  const cat = await Category.findById(req.body.category);
  if (!cat) {
   return next(new ApiError("Category not found", 404));
  }
  const brandId = await Brand.findById(req.body.brand);
  if (!brandId) {
   return next(new ApiError("Brand not found", 404));
  }

  const product = await Product.create({
    ...productData,
    images,
    brand: brandId._id,
    category: cat._id,
  });

  res.status(201).send({
    data: product,
    status: "success",
  });
});

/**
 * @desc   Update Product
 * @route   /api/products/:id
 * @method  PUT
 * @access  Private
 **/
const updateProduct = asyncHandler(async (req, res, next) => {
  const { images, ...productData } = req.body;
  const productId = req.params.id;

  const { error } = ValidationUpdateProduct({
    ...productData,
    images,
    id: req.params.id
  });
  if (error) return res.status(400).json({ error: error.details[0].message });

  const ProductExists = await Product.findById(productId);
  if (!ProductExists) {
   return next(new ApiError("Product not found", 404));
  }

  let cat;
  if (req.body.category) {
    cat = await Category.findById(req.body.category);
    if (!cat) {
     return next(new ApiError("Category not found", 404));
    }
  }
  let brandId;
  if (req.body.brand) {
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
      brand: brandId?._id,
      category: cat?._id,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).send({
    data: product,
    status: "success",
  });
});

/**
 * @desc   Delete Product
 * @route   /api/products/:id
 * @method  DELETE
 * @access  Private
 **/

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
};
