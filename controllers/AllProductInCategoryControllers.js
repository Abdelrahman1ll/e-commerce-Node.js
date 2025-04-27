const asyncHandler = require("express-async-handler");
const { Product } = require("../models/Product");
const {Category} = require("../models/category");
const ApiError = require("../utils/ApiError");

/**
 * @desc   Get All Product In Category
 * @route   /api/AllProductInCategory/:id
 * @method  GET
 * @access  Public
**/
const GetAllProductInCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ApiError("Category not found", 404));
    }
    const products = await Product.find({ Category: category._id });
    if (!products) {
        return next(new ApiError("No products found", 404));
    }
    res.status(200).send({
        results: products.length,
         data: { products },
         status: 'success',
        });
});

module.exports = {GetAllProductInCategory};