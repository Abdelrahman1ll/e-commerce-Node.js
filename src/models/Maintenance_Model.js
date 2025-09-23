const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["ثلاجة", "ديب فريزر", "غسالة اتوماتيك", "سخان", "بوتجاز"],
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
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "maintenance must belong to user"],
    },
    orderNumber: {
      type: Number,
      required: true,
    },
    alias: {
      type: String,
      enum: ["المنزل", "العمل"],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: String,
  },
  { timestamps: true }
);

const slugify = require("slugify");

// توليد slug تلقائيًا قبل الحفظ
maintenanceSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    const timestamp = Date.now().toString().slice(-6); // أخذ آخر 6 أرقام من التاريخ
    this.slug = `${slugify(this.title, { lower: true })}-${timestamp}`;
  }
  next();
});

// إنشاء partial index لتجنب أخطاء null
maintenanceSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { slug: { $exists: true, $ne: null } },
  }
);

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

module.exports = {
  Maintenance,
};
