const {
  User,
} = require("../models/User_Model");
const {
  ValidationSignup,
  ValidationLogin,
} = require("../validations/User.validation");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendVerificationEmail = async (id, email) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // 2- لينك التحقق
  const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "تفعيل حسابك",
    html: `
        <h3>مرحبا بك 🎉</h3>
        <p>من فضلك اضغط على الرابط التالي لتفعيل حسابك:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * @desc    Login with Google
 * @route   /api/auth/signup-google
 * @method  POST
 * @access  Private
 **/
const signupGoogle = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ApiError("Google token is required", 400));
  }

  // تحقق من التوكين
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, given_name, family_name } = payload;

  // شوف المستخدم موجود ولا لأ
  let user = await User.findOne({ email });

  if (!user) {
    // لو مش موجود اعمله حساب جديد
    user = await User.create({
      name: given_name,
      lastName: family_name,
      email,
      isVerified: true, // بما إن جوجل موثق
    });
  }

  // انشئ توكنات
  const refreshToken = jwt.sign(
    { UserInfo: { id: user._id } },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH }
  );

  const accessToken = jwt.sign(
    { UserInfo: { id: user._id, role: user.role } },
    process.env.JWT_SECRET_ACCESS,
    { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS }
  );

  // خزن الـ accessToken في كوكي
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 60 * 60 * 1000, // ساعة
    expires: new Date(Date.now() + 60 * 60 * 1000), // ساعة واحدة
  });

  res.status(200).json({
    status: "success",
    data: user,
    refreshToken,
    accessToken,
  });
});

/**
 * @desc   Register a new user
 * @route   /api/auth/signup
 * @method  POST
 * @access  Private
 **/

const signup = asyncHandler(async (req, res, next) => {
  const { name, lastName, email, phone, password } = req.body;
  const { error } = ValidationSignup(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  let existingUser = await User.findOne({ email });
  let existingUserphone = await User.findOne({ phone });
  if (existingUser || existingUserphone) {
    return next(new ApiError("Email or phone phone is already in use", 400));
  }

  const user = await User.create({
    name,
    lastName,
    email,
    phone,
    password,
  });
  try {
    await sendVerificationEmail(user._id, user.email);
  } catch {
    return next(new ApiError("Failed to send verification email", 502));
  }
  user.password = undefined;

  res.status(201).json({
    data: user,
    status: "success",
    message: "Verification link has been sent to your email.",
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

  const { error } = ValidationLogin(req.body);
  if (error) return next(new ApiError(error.details[0].message, 400));

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return next(new ApiError("Email or password is incorrect", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ApiError("Email or password is incorrect", 401));
  }

  if (user.isVerified === false) {
    return next(new ApiError("Email is not is Verified", 401));
  }

  user.password = undefined;
  // إنشاء JWT توكن
  const refreshToken = jwt.sign(
    { UserInfo: { id: user._id } },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH }
  );

  const accessToken = jwt.sign(
    { UserInfo: { id: user._id, role: user.role } },
    process.env.JWT_SECRET_ACCESS,
    { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS }
  );

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 60 * 60 * 1000, // ساعة واحدة
    expires: new Date(Date.now() + 60 * 60 * 1000), // ساعة واحدة
  });

  res.status(200).json({
    status: "success",
    data: user,
    refreshToken,
    accessToken,
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
    secure: process.env.NODE_ENV === "production", // true بس في prod
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).json({ message: "Logout successful", status: "success" });
});

/**
 * @desc   Resend verification email
 * @route  POST /api/auth/resend-verification
 * @access Public
 */
const resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError("Email is required", 400));
  }

  // تأكد إن اليوزر موجود
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("User not found", 401));
  }

  // لو هو متحقق بالفعل من قبل
  if (user.isVerified) {
    return next(new ApiError("User already is Verified", 400));
  }

  // بعت لينك جديد
  try {
    await sendVerificationEmail(user._id, user.email);
  } catch {
    return next(new ApiError("Failed to send verification email", 502));
  }

  res.status(200).json({
    status: "success",
    message: "A new verification link has been sent to your email",
  });
});

/**
 * @desc   verify a user
 * @route   /api/auth/verify:token
 * @method  GET
 * @access  Private
 **/
const verify = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || !decoded.id) {
    return next(new ApiError("Invalid token", 400));
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ApiError("Invalid User", 400));
  }

  user.isVerified = true;
  user.verifiedAt = new Date();
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
  });
});

/**
 * @desc   Refresh Access Token
 * @route  POST /api/auth/refresh
 * @access Public
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError("Refresh token is required", 400));
  }
  try {
    // تحقق من الـ refreshToken
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

    if (!decoded || !decoded.UserInfo) {
      return next(new ApiError("Invalid refresh token", 400));
    }

    // نجيب اليوزر
    const user = await User.findById(decoded.UserInfo.id);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    // ننشئ Access Token جديد
    const accessToken = jwt.sign(
      { UserInfo: { id: user._id, role: user.role } },
      process.env.JWT_SECRET_ACCESS,
      { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS }
    );

    // ممكن تحدث الكوكي
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 60 * 60 * 1000, // ساعة
      expires: new Date(Date.now() + 60 * 60 * 1000), // ساعة واحدة
    });

    res.status(200).json({
      status: "success",
      accessToken,
    });
  } catch (error) {
    return next(new ApiError("Invalid refresh token", 400));
  }
});

module.exports = {
  signup,
  login,
  logout,
  signupGoogle,
  verify,
  resendVerification,
  refreshToken,
};
