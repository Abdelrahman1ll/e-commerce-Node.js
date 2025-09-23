const asyncHandler = require("express-async-handler");
const { Brand } = require("../models/Brand_Model");
const {
  ValidationCreateBrand,
  ValidationUpdateBrand,
} = require("../validations/Brand.validation");
const ApiError = require("../utils/ApiError");

/**
 * @desc   get Brands
 * @route   /api/brands
 * @method  GET
 * @access  Public
 **/
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  res.status(200).send({
    data: brands,
    status: "success",
  });
});

/**
 * @desc   get Brand by id
 * @route   /api/brands/:id
 * @method  GET
 * @access  Public
 **/
const getBrandById = asyncHandler(async (req, res, next) => {
  const brandId = await Brand.findById(req.params.id);

  if (!brandId) {
    return next(new ApiError("Brand not found", 404));
  }
  res.status(200).send({
    data: brandId,
    status: "success",
  });
});

/**
 * @desc   create a Brand
 * @route   /api/brands
 * @method  POST
 * @access  Private
 **/
const createBrand = asyncHandler(async (req, res, next) => {
  const { error } = ValidationCreateBrand(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const brandExists = await Brand.findOne({ name: req.body.name });
  if (brandExists) {
    return next(new ApiError("Brand already exists", 400));
  }

  const brand = await Brand.create({
    name: req.body.name,
  });

  res.status(201).send({
    data: brand,
    status: "success",
  });
});

/**
 * @desc   update a Brand
 * @route   /api/brands/:id
 * @method  PUT
 * @access  Private
 **/
const updateBrand = asyncHandler(async (req, res, next) => {
  const { error } = ValidationUpdateBrand({
    id: req.params.id,
    name: req.body.name,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const brandId = await Brand.findById(req.params.id);
  if (!brandId) {
    return next(new ApiError("Brand not found", 404));
  }

  const brandExists = await Brand.findOne({ name: req.body.name });
  if (brandExists) {
    return next(new ApiError("Brand already exists", 400));
  }

  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(201).send({
    data: brand,
    status: "success",
  });
});

/**
 * @desc   delete a Brand
 * @route   /api/brands/:id
 * @method  DELETE
 * @access  Private
 **/
const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }
  await Brand.findByIdAndDelete(req.params.id);

  res.status(204).send();
});

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
