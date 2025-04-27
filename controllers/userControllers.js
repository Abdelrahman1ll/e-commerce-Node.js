const { User, ValidationUpdate } = require("../models/User");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { deleteOne } = require("./handlerFactory");
const bcrypt = require("bcryptjs");

/**
 * @desc   Update User
 * @route   /api/user/update/:id
 * @method  PUT
 * @access  Private
 **/
const UpdateUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { name, lastName, email, number } = req.body;
  const userId = req.user._id;
  if (userId != id) {
    return next(new ApiError("You are not allowed to modify it.", 404));
  }
  const { error } = ValidationUpdate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const userExists = await User.findById(id);
  if (!userExists) {
    return next(new ApiError("User not found", 404));
  }

  const user = await User.findByIdAndUpdate(
    id,
    {
      name,
      lastName,
      email,
      number,
    },
    { new: true, runValidators: true }
  ).select("-addresses");

  res.status(201).json({
    user,
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
  if (!users) {
    return next(new ApiError("No users found.", 404));
  }
  res.status(200).send({
    amount: users.length,
    data: { users },
    status: "success",
  });
});

/**
 * @desc   Delete User
 * @route   /api/user/:id
 * @method  DELETE
 * @access  Private
 **/
const deleteUser = deleteOne(User);

/**
 * @desc   Change Password
 * @route   /api/user/forgot-password/:id
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

  // 1. التحقق من وجود جميع الحقول المطلوبة
  if (!passwordNew || !passwordCurrent) {
    return next(new ApiError("جميع الحقول مطلوبة", 400));
  }

  // 4. التحقق من أن كلمة المرور الجديدة مختلفة عن القديمة
  if (passwordNew === passwordCurrent) {
    return next(
      new ApiError("كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة", 400)
    );
  }

  // 2. البحث عن المستخدم

  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError("المستخدم غير موجود", 404));
  }

  if (!user.password) {
    return next(new ApiError("لا يمكن تغيير كلمة المرور", 400));
  }

  if (passwordCurrent && user.password) {
    const isMatch = await bcrypt.compare(passwordCurrent, user.password);
    if (!isMatch) {
      return next(new ApiError("كلمة المرور القديمة غير صحيحة", 400));
    }
  }

  // 5. التحقق من قوة كلمة المرور الجديدة (إضافة إذا لزم الأمر)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(passwordNew)) {
    return next(
      new ApiError(
        "كلمة المرور يجب أن تحتوي على الأقل على 6 أحرف وحرف ورقم",
        400
      )
    );
  }

  await User.findByIdAndUpdate(
    id,
    {
      password: await bcrypt.hash(passwordNew, 12),
    },
    { new: true, runValidators: true }
  ).select("-addresses");

  res.status(200).json({
    status: "success",
    message: "كلمة المرور تم تغييرها بنجاح",
  });
});

module.exports = {
  UpdateUser,
  getAllUsers,
  deleteUser,
  changePassword,
};
