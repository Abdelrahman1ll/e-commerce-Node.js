const {
  validateEmail,
  validateResetCode,
  validatePassword,
  User,
} = require("../models/User_Model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const nodemailer = require("nodemailer");

/**
 * @desc    Send Reset Code
 * @route   /api/user/forgot-password
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

  // إعداد nodemailer لإرسال الإيميل
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    tls: {
      rejectUnauthorized: false, // ✅ تجاوز مشكلة الشهادة
    },
  });

  const mailOptions = {
    from: `My Company <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "🔵 رمز إعادة تعيين كلمة المرور",
    // text: `:رمز إعادة تعيين كلمة المرور الخاص بك هو ${resetCode}`,
    html: `  <p> <span style="color: blue; font-weight: bold;"> ${resetCode}</span> :رمز إعادة تعيين كلمة المرور الخاص بك هو</p>`,
  };
  await transporter.sendMail(mailOptions);

  res.status(200).json({
    message: "Reset code sent successfully!",
  });
});

/**
 * @desc    Verify Reset Code
 * @route   /api/user/reset-code
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
 * @route   /api/user/reset-password
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
