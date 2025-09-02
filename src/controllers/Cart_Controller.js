const asyncHandler = require("express-async-handler");
const { Cart } = require("../models/Cart_Model");
const { Product } = require("../models/Product_Model");
const ApiError = require("../utils/ApiError");
const { DeliveryTax } = require("../models/Delivery_And_Tax_Model");
const mongoose = require("mongoose");

// Update the offer price
const calcTotalCartPrice = async (cart) => {
  if (!cart.products || cart.products.length === 0) {
    cart.totalCartPrice = 0;
    cart.totalPrice = 0;
    return;
  }

  // حساب مجموع أسعار المنتجات
  cart.totalCartPrice = cart.products.reduce((total, p) => {
    const count = p.count ? parseInt(p.count, 10) : 0;
    const price = p.price ? parseFloat(p.price) : 0;
    return total + count * price;
  }, 0);

  // جلب قيم الدليفري والضرائب من قاعدة البيانات بشكل متزامن
  const deliveryAndTax = await DeliveryTax.findOne({});
  const deliveryPrice =
    deliveryAndTax && deliveryAndTax.deliveryPrice
      ? parseFloat(deliveryAndTax.deliveryPrice)
      : 0;
  const taxPrice =
    deliveryAndTax && deliveryAndTax.taxPrice
      ? parseFloat(deliveryAndTax.taxPrice)
      : 0;

  cart.deliveryPrice = deliveryPrice;
  cart.taxPrice = taxPrice;

  // حساب الإجمالي النهائي للسلة: مجموع أسعار المنتجات + الدليفري + الضريبة
  cart.totalPrice = cart.totalCartPrice + deliveryPrice + taxPrice;

  // التأكد من أن القيم ليست NaN
  if (isNaN(cart.totalCartPrice)) {
    cart.totalCartPrice = 0;
  }
  if (isNaN(cart.totalPrice)) {
    cart.totalPrice = 0;
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body; // نستقبل الكمية من الجسم
  const userId = req.user._id;

  // التحقق من وجود الكمية وصحتها
  if (!quantity || isNaN(quantity) || quantity < 1) {
    return next(new ApiError("الكمية المطلوبة غير صالحة", 400));
  }

  const parsedQuantity = parseInt(quantity);

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("المنتج غير موجود", 404));
  }

  let cart = await Cart.findOne({ cartOwner: userId });
  if (!cart) {
     // 👇 هنا بنستخدم CreateCart بدل new Cart
    cart = await Cart.create({ cartOwner: userId, products: [] });
  }

  const existingProductIndex = cart.products.findIndex((p) => {
    if (p.product && typeof p.product === "object") {
      return p.product._id.toString() === productId;
    } else {
      return p.product.toString() === productId;
    }
  });

  if (existingProductIndex !== -1) {
    // تحديث الكمية بالقيمة الجديدة
    cart.products[existingProductIndex].count = parsedQuantity;
  } else {
    // إضافة المنتج بالكمية المحددة
    cart.products.push({
      product: productId,
      price: product.price,
      count: parsedQuantity,
    });
  }

  // تحديث السعر الإجمالي
  await calcTotalCartPrice(cart);
  await cart.save();

  return res.status(200).json({
    data: cart ,
    status: "success",
  });
});

/**
 * @desc    Get cart by user
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ cartOwner: userId });

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  res.status(200).json({
    amount: cart.products.length,
    data:cart,
    status: "success",
  });
});

/**
 * @desc    Update product quantity
 * @route   UPDATE /api/cart/:id
 * @access  Private
 */
const updateCartProductCount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { count } = req.body;

  const cart = await Cart.findOne({ cartOwner: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }

  const itemIndex = cart.products.findIndex(
    (item) => item._id.toString() === id
  );

  if (itemIndex === -1) {
    return next(new ApiError(`No Product Cart item found for this id: ${id}`));
  }
  if (count <= 0) {
    cart.products.splice(itemIndex, 1);
  } else {
    cart.products[itemIndex].count = count;
  }

  await calcTotalCartPrice(cart);
  await cart.save();

  return res.status(200).json({
    data: { cart },
    status: "success",
  });
});

/**
 * @desc   Remove product from cart
 * @route   DELETE /api/cart/:Id
 * @access  Private
 */
const removeCartProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cart = await Cart.findOneAndUpdate(
    { cartOwner: req.user._id },
    {
      $pull: { products: { _id: new mongoose.Types.ObjectId(id) } },
    },
    { new: true }
  );
  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }
  await calcTotalCartPrice(cart);
  await cart.save();
  return res.status(204).json({
    status: "success",
    message: "Product removed from cart successfully",
  });
});

/**
 * @desc    Clear logged user cart
 * @route   DELETE /api/cart/:id
 * @access  Private
 */
const clearLoggedUserCart = asyncHandler(async (req, res) => {
  await Cart.deleteOne({ cartOwner: req.user._id });
  res.status(204);
});

module.exports = {
  addToCart,
  getCart,
  removeCartProduct,
  clearLoggedUserCart,
  updateCartProductCount,
};
