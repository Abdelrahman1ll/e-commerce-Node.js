const {
  validateAddress,
  validateUpdateAddress,
  User,
} = require("../models/User_Model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

/**
 * @desc   Add Address
 * @route   /api/address
 * @method  POST
 * @access  Private
 **/
const createAddress = asyncHandler(async (req, res) => {
  const { alias, details, phone, city, postalCode } = req.body;
  const { error } = validateAddress(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  user.addresses.push({
    alias,
    details,
    phone,
    city,
    postalCode,
  });

  await user.save();

  res.status(201).json({
    result: user.addresses.length,
    status: "success",
    addresses: user.addresses,
  });
});

/**
 * @desc   Get All Addresses
 * @route   /api/address
 * @method  GET
 * @access  Private
 **/
const getAllAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("addresses");
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  res.status(200).json({
    result: user.addresses.length,
    status: "success",
    addresses: user.addresses,
  });
});

/**
 * @desc   Update Address
 * @route   /api/address/:id
 * @method  PUT
 * @access  Private
 **/
const addAddressUpdate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.id;
  const { alias, details, phone, city, postalCode } = req.body;
  const { error } = validateUpdateAddress(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const updateAddress = user.addresses.find((address) => {
    return address._id.toString() === addressId;
  });
  if (!updateAddress) {
    throw new ApiError("Address not found", 404);
  }
  updateAddress.alias = alias;
  updateAddress.details = details;
  updateAddress.phone = phone;
  updateAddress.city = city;
  updateAddress.postalCode = postalCode;

  await updateAddress.save();
  await user.save();
  res.status(201).json({
    result: user.addresses.length,
    status: "success",
    data: updateAddress,
  });
});

/**
 * @desc   Delete Address
 * @route   /api/address/:id
 * @method  PUT
 * @access  Private
 **/
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addressId = req.params.id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const updateAddress = user.addresses.find((address) => {
    return address._id.toString() === addressId;
  });
  if (!updateAddress) {
    throw new ApiError("Address not found", 404);
  }
  user.addresses.pull(updateAddress);
  await user.save();

  res
    .status(201)
    .json({ message: "Address deleted successfully", success: "success" });
});

module.exports = {
  createAddress,
  addAddressUpdate,
  getAllAddresses,
  deleteAddress,
};
