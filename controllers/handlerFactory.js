const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

// Delete document
const deleteOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No document found for this ID ${id}`, 404));
    }
    res.status(204).send();
  });
};

// Get all
const getAll = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const data = await Model.find();
    if (!data) {
      return next(new ApiError("No data found.", 404));
    }
    res.status(200).send({
      amount: data.length,
      data,
      status: "success",
    });
  });
};

// Get one
const getOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const data = await Model.findById(id);
    if (!data) {
      return next(new ApiError(`No document found for this ID ${id}`, 404));
    }
    res.status(200).send({
      data,
      status: "success",
    });
  });
};

module.exports = { deleteOne, getAll,getOne };
