const mongoose = require("mongoose");
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
    phone: {
      type: String,
    },
    password: {
      type: String,
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
    if (!this.password) return next();
    this.password = await bcrypt.hash(this.password, 10);
  } else {
    next();
  }
  next();
});

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
  if (!this.phone) {
    this.phone = `default-${Date.now()}-${Math.floor(Math.random() * 10000)}`; // قيمة افتراضية فريدة
  }
  next();
});

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $ne: null } },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
