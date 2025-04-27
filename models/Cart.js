const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "Product" },
        count: { type: Number, default: 1 },
        price: Number,
      },
    ],
    totalCartPrice: Number,
    cartOwner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    deliveryPrice: {
      type: Number,
      default: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'products.product',
  });

  next();
});
const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Cart };