const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    number: {
      type: String,
    },
    password: {
      type: String,
      // required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetCode: {
      type: Number,
    },
    resetCodeExpires: {
      type: Date,
    },
    theCodeIsCorrect: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: { type: String, enum: ["المنزل", "العمل"], required: true },
        details: { type: String, required: true },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if(!this.password) return next()
    this.password = await bcrypt.hash(this.password, 10);
  } else {
    next();
  }
  next();
});

const ValidationSignup = (odj) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    number: Joi.string()
      .pattern(/^01[0-25]\d{8}$/)
      .required(),
    password: Joi.string().min(6).max(30).pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,30}$/).required(),
    passwordConfirm: Joi.string().valid(Joi.ref("password")).required(),
    role: Joi.string().valid("user", "admin").default("user"),
  });
  return schema.validate(odj);
};

const ValidationLogin = (odj) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });
  return schema.validate(odj);
};
const ValidationUpdate = (odj) => {
  const schema = Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    name: Joi.string().min(3).max(20),
    lastName: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    number: Joi.string().pattern(/^01[0-25]\d{8}$/),
  });
  return schema.validate(odj);
};

const validateEmail = (odj) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(odj);
};

const validateResetCode = (odj) => {
  const schema = Joi.object({
    resetCode: Joi.number().required(),
    email: Joi.string().email().required(),
  });
  return schema.validate(odj);
};

const validatePassword = (odj) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    passwordConfirm: Joi.string().valid(Joi.ref("password")).required(),
  });
  return schema.validate(odj);
};

const validateAddress = (odj) => {
  const schema = Joi.object({
    details: Joi.string().required(),
    phone: Joi.string()
      .pattern(/^01[0-25]\d{8}$/)
      .required(),
    city: Joi.string().required(),
    postalCode: Joi.string(),
    alias: Joi.string().required(),
  });
  return schema.validate(odj);
};

const validateUpdateAddress = (odj) => {
  const schema = Joi.object({
    details: Joi.string(),
    phone: Joi.string().pattern(/^01[0-25]\d{8}$/),
    city: Joi.string(),
    postalCode: Joi.string(),
    alias: Joi.string(),
  });
  return schema.validate(odj);
};

const slugify = require("slugify");

// توليد slug تلقائيًا قبل الحفظ
userSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    const timestamp = Date.now().toString().slice(-6); // أخذ آخر 6 أرقام من التاريخ
    this.slug = `${slugify(this.name, { lower: true })}-${timestamp}`;
  }
  next();
});

// إنشاء partial index لتجنب أخطاء null
userSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { slug: { $exists: true, $ne: null } },
  }
);

userSchema.pre("save", function (next) {
  if (!this.number) {
    this.number = `default-${Date.now()}-${Math.floor(Math.random() * 10000)}`; // قيمة افتراضية فريدة
  }
  next();
});

userSchema.index(
  { number: 1 },
  {
    unique: true,
    partialFilterExpression: { number: { $ne: null } },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  ValidationSignup,
  ValidationLogin,
  ValidationUpdate,
  validateEmail,
  validateResetCode,
  validatePassword,
  validateAddress,
  validateUpdateAddress,
};
