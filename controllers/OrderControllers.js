const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { Order } = require("../models/Order");
const { User } = require("../models/User");
const { Cart } = require("../models/Cart");
const nodemailer = require("nodemailer");
const {deleteOne,getAll,getOne} = require("./handlerFactory");
const { Product } = require("../models/Product");
const { default: mongoose } = require("mongoose");
/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }); 
  res.status(200).send({
    amount: orders.length,
    data: orders,
    status: "success",
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = getOne(Order);

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res, next) => {
  const { cartId,shippingAddress } = req.body;

  // ✅ جلب بيانات السلة
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  // ✅ جلب بيانات المستخدم
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  
  
  for (const item of cart.products) { // التعديل هنا من cartItems إلى products
    const product = await Product.findById(item.product._id);
    
    if (!product) {
      return next(new ApiError("Product not found", 404));
    }
    
    if (product.quantity < item.count) {
      return next(new ApiError(
        'Product is out of stock. Available quantity',
        400
      ));
    }
  }
  



  // ✅ البحث عن آخر رقم طلب
  const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
  const newOrderNumber = lastOrder?.orderNumber
    ? lastOrder.orderNumber + 1
    : 1001;

  
  // ✅ إنشاء الطلب
  const order = new Order({
    orderNumber: newOrderNumber,
    user: user._id,
    cartItems: cart.products || [],
    shippingAddress,
    taxPrice:cart.taxPrice || 0,
    deliveryPrice: cart.deliveryPrice || 0,
    totalCartPrice: cart.totalCartPrice || 0,
    totalPrice: cart.totalPrice || 0,
  });
  await order.save();

  
    // for (const item of cart.products) {
    //   const product = await Product.findById(item.product._id);
    //   if (product) {
    //     product.quantity -= item.count;
    //     await product.save();
    //   }
      
    // }
  
 // تحديث المخزون باستخدام الجلسة
 const session = await mongoose.startSession();
 session.startTransaction();
 try {
   for (const item of cart.products) {
     await Product.findByIdAndUpdate(
       item.product._id,
       { $inc: { quantity: -item.count } },
       { session }
     );
   }
   await session.commitTransaction();
 } catch (error) {
   await session.abortTransaction();
   return next(new ApiError("فشل في تحديث المخزون", 500));
 } finally {
   session.endSession();
 }


  // ✅ حذف السلة
  await Cart.findByIdAndDelete(cartId);
  await user.save();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    host: "smtp.gmail.com",
    port: 587,
    secure: true, // true for 465, false for other ports

    tls: {
      rejectUnauthorized: false, // ✅ تجاوز مشكلة الشهادة
    },
  });

  const mailOptions = {
    from: `My Company <${process.env.EMAIL_USER}>`,
    to: "abdoabdoyytt5678@gmail.com",
    subject: `🛍️ طلب جديد من ${user.name}`,
    html: `
    <html dir="rtl">
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 5px; padding: 20px; margin: auto; max-width: 600px;">
          
          <!-- رقم الطلب -->
          <div style="margin-bottom: 15px;">
            <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">رقم الطلب:</p>
            <p style="margin: 0; color: #555; display: inline-block;">${order.orderNumber}</p>
          </div>
          
          <!-- تفاصيل المنتجات -->
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">تفاصيل المنتجات:</h3>
            ${order.cartItems.map(item => `
              <div style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">اسم المنتج:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${item.product.title}</p>
                <br />
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الكمية:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${item.count || 1}</p>
                <br />
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">السعر:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${item.price || item.product.price}</p>
              </div>
            `).join("")}
          </div>
          
          <!-- عنوان الشحن -->
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">عنوان الشحن:</h3>
            <div style="background-color: #f9f9f9; border-radius: 5px; padding: 10px; word-wrap: break-word;">
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الاسم المستعار:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${order.shippingAddress.alias}</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">العنوان:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${order.shippingAddress.details}</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الهاتف:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${order.shippingAddress.phone}</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">المدينة:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${order.shippingAddress.city}</p>
              <br />
            </div>
          </div>
          
          <!-- التفاصيل المالية -->
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">التفاصيل المالية:</h3>
            <div style="background-color: #f9f9f9; border-radius: 5px; padding: 10px;">
              
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">تكلفة الشحن:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${order.deliveryPrice || 0}</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">قيمة الضريبة:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${order.taxPrice || 0}</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">قيمة السلة:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${order.totalCartPrice || 0}</p>
              <br />
            </div>
          </div>
          
          <!-- الإجمالي -->
          <div style="margin-top: 10px;">
            <p style="font-weight: bold; color: #d9534f; font-size: 22px; margin: 0; display: inline-block; width: 150px;">${order.paymentMethodType === "card" ? '' : 'الإجمالي:'}</p>
            <p style="font-weight: bold; color: #d9534f; font-size: 22px; margin: 0; display: inline-block;">${order.paymentMethodType === "card" ? "تم الدفع بالبطاقة" : order.totalPrice || 0 }</p>
          </div>
          
        </div>
      </body>
    </html>
  `,
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending mail:", error);
    else console.log("Email sent:", info.response);
  });

  res.status(201).json({
    status: "success",
    data: order,
  });
});



/**
 * @desc    Get all orders by user
 * @route   GET /api/orders/user
 * @access  Private
 */
const getAllOrdersByUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId) 
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }); 
  res.status(200).send({
    amount: orders.length,
    data: orders,
    status: "success",
  });
});

/**
 * @desc    Mark an order as delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Private
 */
const updateOrderDeliveryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // ✅ تحديث حالة التوصيل
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({
    message: "Order marked as delivered",
    data: order,
    status: "success",
  });
});

/**
 * @desc    Mark an order as paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // ✅ تحديث حالة الدفع
  order.isPaid = true;
  order.paidAt = Date.now();

  await order.save();

  res.status(200).json({
    message: "Order marked as paid",
    data: order,
    status: "success",
  });
});



module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  getAllOrdersByUser,
  updateOrderDeliveryStatus,
  updateOrderPaymentStatus,
};
