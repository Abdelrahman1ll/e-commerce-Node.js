const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "order must belong to user"],
  },
  cartItems: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: "Product" },
      count: { type: Number, default: 1 },
      price: Number,
    },
  ],
  shippingAddress: {
    alias: { type: String, enum: ["المنزل", "العمل"], required: true },
    details: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: String,
  },
  taxPrice: {
    type: Number,
    default: 0.0,
  },
  deliveryPrice: {
    type: Number,
    default: 0.0,
  },
  totalCartPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentMethodType: {
    type: String,
    enum: ["card", "cash"],
    default: "cash",
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email lastName number -_id",
  }).populate({
    path: "cartItems.product",
    populate: {
      path: "category",
      model: "category",
    },
  });

  next();
});

// **إضافة Auto Increment لرقم الطلب**
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const lastOrder = await this.constructor.findOne().sort("-orderNumber");
    this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
