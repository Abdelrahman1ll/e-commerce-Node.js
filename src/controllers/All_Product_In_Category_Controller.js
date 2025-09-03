const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { Product } = require("../models/Product_Model");
const { Category } = require("../models/Category_Model");
/**
 * @desc   Get All Product In Category
 * @route   /api/product-category/:id
 * @method  GET
 * @access  Public
 **/
const GetAllProductInCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  const products = await Product.find({ category: category._id });
  res.status(200).send({
    results: products.length,
    data: products,
    status: "success",
  });
});

module.exports = { GetAllProductInCategory };
