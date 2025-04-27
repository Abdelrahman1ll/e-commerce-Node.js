const mongoose = require('mongoose');
const {Product} = require('./Product');
const Joi = require("joi");

const reviewSchema = new mongoose.Schema(
    {
      review: {
        type: String,
        required: [true, 'review title required'],
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'review rating required'],
      },
      // Parent reference
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to user'],
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'review must belong to product'],
      },
    },
    {
      timestamps: true,
    }
  );
  reviewSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'user',
      select: 'name email lastName number _id',
    });
    next();
  });
  const ValidationCreateReview = (odj) => {
    const schema = Joi.object({
      review: Joi.string().required(),
      rating: Joi.number().min(1).max(5).required(),
      product: Joi.string().required(),
    });
    return schema.validate(odj);
  };

  const ValidationUpdateReview = (odj) => {
    const schema = Joi.object({
      review: Joi.string(),
      rating: Joi.number().min(1).max(5),
    });
    return schema.validate(odj);
  };
// 🛠️ دالة لتحديث عدد التقييمات ومتوسط التقييم
reviewSchema.statics.calcProductRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },  // اجلب التقييمات لهذا المنتج فقط
    {
      $group: {
        _id: "$product",
        numReviews: { $sum: 1 },  // حساب عدد التقييمات
        averageRating: { $avg: "$rating" },  // حساب متوسط التقييم
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numReviews: stats[0].numReviews,
      averageRating: stats[0].averageRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      numReviews: 0,
      averageRating: 0,
    });
  }
};

// تحديث المتوسط والعدد بعد كل تقييم جديد
reviewSchema.post('save', function () {
  this.constructor.calcProductRatings(this.product);
});

// تحديث المتوسط والعدد بعد حذف أو تعديل التقييم
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcProductRatings(doc.product);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = {Review,ValidationCreateReview,ValidationUpdateReview};