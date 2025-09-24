const { User } = require("../models/User_Model");
const { ValidationUpdate } = require("../validations/User.validation");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
/**
 * @desc   Update User
 * @route   /api/users/update/:id
 * @method  PUT
 * @access  Private
 **/
const UpdateUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { name, lastName, email, phone } = req.body;
  const userId = req.user._id;
  const userExists = await User.findById(id);
  if (!userExists) {
    return next(new ApiError("User not found", 404));
  }

  if (userId.toString() !== id.toString()) {
    return next(new ApiError("You are not allowed to modify it.", 403));
    // الأفضل هنا 403 Forbidden بدل 404
  }
  const { error } = ValidationUpdate({
    id: id,
    name,
    lastName,
    email,
    phone,
  });
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findByIdAndUpdate(
    id,
    {
      name,
      lastName,
      email,
      phone,
    },

    { new: true, runValidators: true }
  ).select("-addresses");

  res.status(201).json({
    data: user,
    status: "success",
  });
});

/**
 * @desc   Get All Users
 * @route   /api/users
 * @method  GET
 * @access  Private
 **/
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ role: { $ne: "admin" } }).select(
    "-password -resetCodeUsed -addresses"
  );
  res.status(200).send({
    amount: users.length,
    data: users,
    status: "success",
  });
});

/**
 * @desc   Delete User
 * @route   /api/users/:id
 * @method  DELETE
 * @access  Private
 **/
const deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  if (userId.toString() !== id.toString()) {
    return next(new ApiError("You are not allowed to delete it.", 403));
  }
  await User.findByIdAndDelete(id);

  res.status(204).send();
});

/**
 * @desc   Change Password
 * @route   /api/users/forgot-password/:id
 * @method  PUT
 * @access  Private
 **/
const changePassword = asyncHandler(async (req, res, next) => {
  const { passwordNew, passwordCurrent } = req.body;
  const id = req.params.id;
  const userId = req.user._id;

  if (userId != id) {
    return next(new ApiError("You are not allowed to modify it.", 404));
  }

  if (!passwordNew || !passwordCurrent) {
    return next(new ApiError("All fields are required", 400));
  }

  if (passwordNew === passwordCurrent) {
    return next(
      new ApiError("The new password must be different from the old one.", 400)
    );
  }

  const user = await User.findById(id);

  if (!user.password) {
    return next(new ApiError("Password cannot be changed", 400));
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(passwordNew)) {
    return next(
      new ApiError(
        "The password must contain at least 6 characters, a letter, and a number.",
        400
      )
    );
  }

  const isMatch = await bcrypt.compare(passwordCurrent, user.password);
  if (!isMatch) {
    return next(new ApiError("The old password is incorrect", 400));
  }

  await User.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(passwordNew, 10),
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});

module.exports = {
  UpdateUser,
  getAllUsers,
  deleteUser,
  changePassword,
};
