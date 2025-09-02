const {
  ValidationCreateReview,
  ValidationUpdateReview,
} = require("../models/Review_Model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { Review } = require("../models/Review_Model");
const { Product } = require("../models/Product_Model");
/**
 * @desc   Create a new review
 * @route   POST /api/review
 * @access  Private
 */
const createReview = asyncHandler(async (req, res, next) => {
  const { review, rating, product } = req.body;
  const userId = req.user._id; // استخراج userId من التوكن

  const { error } = ValidationCreateReview(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const existingReview = await Review.findOne({ user: userId, product });
  if (existingReview) {
    return next(new ApiError("لقد قمت بتقييم هذا المنتج من قبل", 404));
  }

  const newReview = await Review.create({
    review,
    rating,
    product,
    user: userId,
  });
  res.status(201).json({
    data: newReview,
    status: "success",
  });
});

/**
 * @desc   Update a review
 * @route   UPDATE /api/review/:Id
 * @access  Private
 */
const UpdateReview = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { review, rating } = req.body;
  const userId = req.user._id.toString(); // استخراج ID المستخدم من التوكن
  const { error } = ValidationUpdateReview(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const reviewExists = await Review.findById(id);
  if (!reviewExists) {
    return next(new ApiError("Review not found", 404));
  }
  if (reviewExists.user._id.toString() !== userId) {
    return next(new ApiError("غير مصرح لك بتعديل هذه التقييم", 403));
  }
  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { review, rating },
    { new: true }
  );
  res.status(201).json({
    data: updatedReview,
    status: "success",
  });
});

/**
 * @desc   Delete a review
 * @route   DELETE /api/review/:id
 * @access  Private
 */

const deleteReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.id;
  const userId = req.user._id.toString(); // ID المستخدم من التوكن
  const userRole = req.user.role; // دور المستخدم (مثلاً 'admin' أو 'user')

  // 1. ابحث عن المراجعة أولًا دون حذفها
  const review = await Review.findById(reviewId);

  // 2. تحقق من وجود المراجعة
  if (!review) {
    return next(new ApiError("المراجعة غير موجودة", 404));
  }

  // 3. إذا كان المستخدم ليس مشرفًا، فتأكد أنه صاحب المراجعة
  if (userRole !== "admin" && review.user._id.toString() !== userId) {
    return next(new ApiError("غير مصرح لك بحذف هذه المراجعة", 403));
  }

  // 4. احذف المراجعة (مشرف أو صاحب المراجعة)
  await Review.deleteOne({ _id: reviewId });
  res.status(204);
});

/**
 * @desc   All reviews for this product
 * @route   GET /api/review/product/:productId
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  const reviews = await Review.find({ product: product._id });

  res.status(200).json({
    amount: reviews.length,
    data: { reviews },
    status: "success",
  });
});
module.exports = {
  createReview,
  getProductReviews,
  UpdateReview,
  deleteReview,
};
