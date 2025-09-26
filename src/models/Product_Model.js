const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  PriceBeforeDiscount: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  dleteImages: [
    {
      type: String,
    },
  ],
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    set: (val) => Math.round(val * 10) / 10, // 3.6666 * 10 = 36.666  = 37 = 3.7
    default: 0,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const slugify = require("slugify");
// توليد slug تلقائيًا قبل الحفظ
productSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    const timestamp = Date.now().toString().slice(-6); // أخذ آخر 6 أرقام من التاريخ
    this.slug = `${slugify(this.title, { lower: true })}-${timestamp}`;
  }
  next();
});

// إنشاء partial index لتجنب أخطاء null
productSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { slug: { $exists: true, $ne: null } },
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
