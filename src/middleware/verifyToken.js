const jwt = require("jsonwebtoken");
const { User } = require("../models/User_Model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const verifyToken = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || req.headers.Authorization;
  let token;
  if (authorization && authorization.startsWith("Bearer ")) {
    token = authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please log in to access this page.",
        401
      )
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
    req.user = await User.findById(decoded.UserInfo.id).select("-password");

    if (!req.user) {
      return next(new ApiError("User not found", 401));
    }
    req.userId = req.user._id;

    next(); // السماح بالوصول بعد التحقق
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("JWT expired, please refresh your token.", 401));
    } else {
      return next(new ApiError("jwt malformed", 401));
    }
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to access this path.", 403)
      );
    }
    next();
  };
};
module.exports = { verifyToken, authorize };
