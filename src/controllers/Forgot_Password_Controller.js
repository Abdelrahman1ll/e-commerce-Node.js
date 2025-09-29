const { User } = require("../models/User_Model");
const {
  validateEmail,
  validateResetCode,
  validatePassword,
} = require("../validations/User.validation");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/ApiEmail");

/**
 * @desc    Send Reset Code
 * @route   /api/forgot-password
 * @method  POST
 * @access  Public
 **/
const sendResetCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { error } = validateEmail(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User with this email does not exist", 404);
  }

  // إنشاء كود عشوائي مكون من 4 أرقام
  const resetCode = Math.floor(100000 + Math.random() * 900000);

  // حفظ الكود في قاعدة البيانات مع مدة صلاحية
  user.resetCode = resetCode;
  user.resetCodeExpires = Date.now() + 2 * 60 * 1000;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "🔵 Password reset code",
    html: `  <p> <span style="color: blue; font-weight: bold;"> ${resetCode}</span> Your password reset code is: </p>`,
  });

  res.status(200).json({
    message: "Reset code sent successfully!",
  });
});

/**
 * @desc    Verify Reset Code
 * @route   /api/reset-code
 * @method  POST
 * @access  Public
 **/
const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, resetCode } = req.body;

  const { error } = validateResetCode(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // البحث عن المستخدم
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // التحقق من صلاحية كود إعادة التعيين
  if (!user.resetCode || user.resetCodeExpires < Date.now()) {
    throw new ApiError("Reset code expired. Please request a new one.", 400);
  }

  // التحقق من صحة الكود
  if (user.resetCode !== parseInt(resetCode)) {
    throw new ApiError("Invalid reset code.", 400);
  }
  user.theCodeIsCorrect = true;
  await user.save();
  res.status(200).json({
    message: "Reset code verified successfully",
  });
});

/**
 * @desc    Reset Password
 * @route   /api/reset-password
 * @method  POST
 * @access  Public
 **/
const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = validatePassword(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  if (!user.theCodeIsCorrect) {
    return next(new ApiError("Invalid reset code", 400));
  }

  user.password = password;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  user.theCodeIsCorrect = false;
  await user.save();
  res.status(200).json({
    success: "success",
    message: "Password reset successfully!",
  });
});

module.exports = {
  sendResetCode,
  verifyResetCode,
  resetPassword,
};
