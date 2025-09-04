const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const {
  validateCustomer,
  UpdateCustomer,
  Customer,
} = require("../models/Off_Site_Customers_Model");
/**
 * @desc   Get All Customers Who Are Not On The Site
 * @route   /api/customers
 * @method GET
 * @access Public
 **/
const GetAllCustomer = asyncHandler(async (req, res, next) => {
  const data = await Customer.find();
  res.status(200).send({
    amount: data.length,
    data,
    status: "success",
  });
});

/**
 * @desc   Create Customer
 * @route   /api/customers
 * @method POST
 * @access Private
 **/
const createCustomer = asyncHandler(async (req, res, next) => {
  const { name, phoneNumber, data } = req.body;
  const { error } = validateCustomer(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const customerExists = await Customer.findOne({ phoneNumber });
  if (customerExists) {
    return next(new ApiError("Customer already exists.", 409));
  }
  const customer = await Customer.create({ name, phoneNumber, data });
  res.status(201).send({
    data: customer ,
    status: "success",
  });
});

/**
 * @desc   update a Customer
 * @route   /api/customers/:id
 * @method PUT
 * @access Private
 **/
const updateCustomer = asyncHandler(async (req, res) => {
  const { name, phoneNumber, data } = req.body;
  const { error } = UpdateCustomer(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name, phoneNumber, data },
    { new: true }
  );

  res.status(201).send({
    data: customer,
    status: "success",
  });
});

/**
 * @desc   Delete Customer
 * @route   /api/customers/:id
 * @method DELETE
 * @access Private
 **/
const deleteCustomer = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const document = await Customer.findByIdAndDelete(id);
  if (!document) {
    return next(new ApiError(`No document found for this ID`, 404));
  }
  res.status(204).send();
});

module.exports = {
  GetAllCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
