const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

const ValidationCreateCategory = (odj) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
  });
  return schema.validate(odj);
};

const ValidationUpdateCategory = (odj) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/) // regex للـ ObjectId
      .required(),
    name: Joi.string().min(3).max(20),
  });
  return schema.validate(odj);
};

const slugify = require("slugify");

// توليد slug تلقائيًا قبل الحفظ
categorySchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    const timestamp = Date.now().toString().slice(-6); // أخذ آخر 6 أرقام من التاريخ
    this.slug = `${slugify(this.name, { lower: true })}-${timestamp}`;
  }
  next();
});

// إنشاء partial index لتجنب أخطاء null
categorySchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { slug: { $exists: true, $ne: null } },
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = {
  Category,
  ValidationCreateCategory,
  ValidationUpdateCategory,
};
