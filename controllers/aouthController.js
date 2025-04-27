const { User, ValidationSignup, ValidationLogin } = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const cookieParser = require('cookie-parser');
const { date } = require("joi");
/**
 * @desc   Register a new user
 * @route   /api/auth/signup-google
 * @method  POST
 * @access  Private
 **/
const signupGoogle = asyncHandler(async (req, res, next) => {
  const { name, lastName, email } = req.body;

  if (!name || !lastName || !email) {
    return next(new ApiError("The email or password is incorrect.", 404));
  }
  let existingUser = await User.findOne({ email }).select("-addresses");
  if (existingUser) {
    return next(new ApiError("The email is incorrect.", 404));
  }

  const userData = { name, lastName, email };

  const user = await User.create(userData);

  res.status(201).json({
    data: { user },
    status: "success",
  });
});
/**
 * @desc   Register a new user
 * @route   /api/auth/signup
 * @method  POST
 * @access  Private
 **/

const signup = asyncHandler(async (req, res, next) => {
  const { name, lastName, email, number, password, passwordConfirm } = req.body;

  const { error } = ValidationSignup(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  let existingUser = await User.findOne({  email }).select("-addresses");
  let existingUserNumber = await User.findOne({ number }).select("-addresses");
  if (existingUser || existingUserNumber) {
    return next(new ApiError("The number or email is already registered.", 409));
  }
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    return next(new ApiError("كلمة المرور يجب أن تحتوي على الأقل على 6 أحرف وحرف ورقم", 400));
  }

  const userData = { name, lastName, email, number, password, passwordConfirm };

  const user = await User.create(userData);

  res.status(201).json({
    data: { user },
    status: "success",
  });
});

/**
 * @desc   Login a user
 * @route   /api/auth/login
 * @method  POST
 * @access  Private
 **/
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  // التحقق من صحة البيانات المدخلة
  const { error } = ValidationLogin(req.body);
  if (error) return next(new ApiError(error.details[0].message, 400));

  // البحث عن المستخدم في قاعدة البيانات
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401));
  }
if(user.password){
  // التحقق من وجود كلمة مرور
  if (!password) {
    return next(new ApiError("يرجى إدخال كلمة المرور", 400));
  }
// التحقق من تطابق كلمة المرور
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return next(new ApiError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401));
}
}
  
user.password = undefined; // إزالة كلمة المرور من كائن المستخدم
user.addresses = undefined; // إزالة العناوين من كائن المستخدم
  // إنشاء JWT توكن
  const token = jwt.sign(
    { UserInfo: { id: user._id, role: user.role } },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true, // https
    sameSite: "None", // cross-site cookie
    maxAge: 30 * 24 * 60 * 60 * 1000,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

  })
  

  res.status(200).json({
    status: "success",
    data: {
      user: user,
      token
    }
  });
});



/**
 * @desc   Logout a user
 * @route   /api/auth/logout
 * @method  POST
 * @access  Private
 **/
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true, // https
    sameSite: "None", // cross-site cookie
  });
  res.status(200).json({ message: "Logout successful", status: "success" });
});



module.exports = { signup, login, logout, signupGoogle };
