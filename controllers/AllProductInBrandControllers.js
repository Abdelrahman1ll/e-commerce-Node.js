const asyncHandler = require("express-async-handler");
const { Product } = require("../models/Product");
const {Brand} = require("../models/brand");
const ApiError = require("../utils/ApiError");
/**
 * @desc   Get All Product In Brand
 * @route   /api/AllProductInBrand/:id
 * @method  GET
 * @access  Public
**/
const GetAllProductInBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        return next(new ApiError("Brand not found", 404));
    }
    const products = await Product.find({ brand: brand._id });
    if (!products) {
        return next(new ApiError("No products found", 404));
    }
    res.status(200).send({
        results: products.length,
         data: { products },
         status: 'success',
        })
});

module.exports = {GetAllProductInBrand};