const asyncHandler = require("express-async-handler");
const {
  ValidationCreateCategory,
  ValidationUpdateCategory,
  Category,
} = require("../models/Category_Model");
const ApiError = require("../utils/ApiError");

/**
 * @desc   Get All Category
 * @route   /api/category
 * @method GET
 * @access Public
 **/
const GetAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).send({
    data: categories,
    status: "success",
  });
});

/**
 * @desc   Get Category By ID
 * @route   /api/category/:id
 * @method GET
 * @access Public
 **/
const GetCategoryById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await Category.findById(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(200).send({
    data: category,
    status: "success",
  });
});

/**
 * @desc   Create Category
 * @route   /api/category
 * @method POST
 * @access Private
 **/
const CreateCategory = asyncHandler(async (req, res, next) => {
  const { error } = ValidationCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const categoryExists = await Category.findOne({ name: req.body.name });
  if (categoryExists) {
    return next(new ApiError("Category already exists", 400));
  }

  const category = await Category.create(req.body);

  res.status(201).send({
    data: category,
    status: "success",
  });
});

/**
 * @desc   Update Category
 * @route   /api/category/:id
 * @method PUT
 * @access Private
 **/
const UpdateCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { error } = ValidationUpdateCategory({
    id: id,
    name: req.body.name,
  });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const categoryId = await Category.findById(id);
  if (!categoryId) {
    return next(new ApiError("Category not found", 404));
  }

  const categoryExists = await Category.findOne({ name: req.body.name });
  if (categoryExists) {
    return next(new ApiError("Category already exists", 400));
  }

  const category = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).send({
    data: category,
    status: "success",
  });
});

/**
 * @desc   Delete Category
 * @route   /api/category/:id
 * @method DELETE
 * @access Private
 **/
const DeleteCategory = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const category = await Category.findById(id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  await Category.findByIdAndDelete(id);

  res.status(204).send();
});

module.exports = {
  GetAllCategory,
  GetCategoryById,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
};
