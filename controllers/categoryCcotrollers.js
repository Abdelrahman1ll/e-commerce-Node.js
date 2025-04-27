const asyncHandler = require("express-async-handler");
const { Category ,ValidationCreateCategory,ValidationUpdateCategory} = require("../models/category");
const ApiError = require("../utils/ApiError");
const {deleteOne,getAll,getOne} = require("./handlerFactory");
/**
 * @desc   Get All Category
 * @route   /api/category
 * @method GET
 * @access Public
**/
const GetAllCategory = getAll(Category);

/**
 * @desc   Get Category By ID
 * @route   /api/category/:id
 * @method GET
 * @access Public
**/
const GetCategoryById = getOne(Category);

/**
 * @desc   Create Category
 * @route   /api/category
 * @method POST
 * @access Private
**/
const CreateCategory = asyncHandler(async (req, res) => {
  const { error } = ValidationCreateCategory(req.body);
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }
  const category = new Category({name: req.body.name});
  
  await category.save();
  res.status(201).send({
    data:{category},
    status:"success"
  });
});

/**
 * @desc   Update Category
 * @route   /api/category/:id
 * @method PUT
 * @access Private
**/
const UpdateCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const categoryId = await Category.findById(id);
  if (!categoryId) {
    throw new ApiError("Category not found.", 404);
  }
  const { error } = ValidationUpdateCategory(req.body);
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }
  const category = await Category.findByIdAndUpdate(
    id,
    {name: req.body.name},
    { new: true }
  );
  
  res.status(201).send({
    data:{category},
    status:"success"
  });
});

/**
 * @desc   Delete Category
 * @route   /api/category/:id
 * @method DELETE
 * @access Private
**/
const DeleteCategory = deleteOne(Category);

module.exports = {
  GetAllCategory,
  GetCategoryById,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
};
