const mongoose = require("mongoose");
const Joi = require("joi");

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
  image: {
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
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
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


const ValidationCreateProduct = (odj) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().required(),
    image: Joi.string().required(),
    images: Joi.array(),
    brand: Joi.string().required(),
    Category: Joi.string().required(),
    price: Joi.number().required(),
    PriceBeforeDiscount: Joi.number(),
    quantity: Joi.number().required(),
    
  });
  return schema.validate(odj);
};

const ValidationUpdateProduct = (odj) => {
  const schema = Joi.object({
    title: Joi.string().min(3),
    description: Joi.string(),
    image: Joi.string(),
    images: Joi.array(),
    brand: Joi.string(),
    Category: Joi.string(),
    price: Joi.number(),
    PriceBeforeDiscount: Joi.number(),
    quantity: Joi.number(),
  });
  return schema.validate(odj);
};

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

// const setImageUrl = (doc) => {
//   if (doc.image) {
//     const imageUrl = `${process.env.BASE_URL}/${doc.image}`;
//     doc.image = imageUrl;
//   }
//   if (doc.images) {
//     const images = [];
//     doc.images.forEach((image) => {
//       const imageUrl = `${process.env.BASE_URL}/${image}`;
//       images.push(imageUrl);
//     });
//     doc.images = images;
//   }
// };


const setImageUrl = (doc) => {
  if (doc.image) {
    // التعديل: التحقق من أن المسار ليس URL مكتمل
    if (!doc.image.startsWith('http')) {
      const imageUrl = `https://e-commerce-node-js-tan.vercel.app/${doc.image}`;
      doc.image = imageUrl;
    }
  }
  if (doc.images) {
    const images = [];
    doc.images.forEach((image) => {
      if (!image.startsWith('http')) {
        const imageUrl = `https://e-commerce-node-js-tan.vercel.app/${image}`;
        images.push(imageUrl);
      } else {
        images.push(image);
      }
    });
    doc.images = images;
  }
};







productSchema.post("init", (doc) => {
  setImageUrl(doc);
});

productSchema.post("save", (doc) => {
  setImageUrl(doc);
});

const Product = mongoose.model("Product", productSchema);

module.exports = { Product, ValidationCreateProduct, ValidationUpdateProduct };
