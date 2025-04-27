const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { Order } = require("../models/Order");
const { User } = require("../models/User");
const { Cart } = require("../models/Cart");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const MERCHANT_ID = process.env.KASHIER_MERCHANT_ID;
const API_KEY = process.env.KASHIER_API_KEY;

// Helper function to generate Kashier payment hash
const generateKashierOrderHash = (order) => {
  const mid = MERCHANT_ID;
  const amount = order.totalPrice.toFixed(2);
  const currency = "EGP";
  const orderId = order._id.toString();
  const secret = API_KEY;

  const path = `/?payment=${mid}.${orderId}.${amount}.${currency}`;
  return crypto.createHmac("sha256", secret).update(path).digest("hex");
};

/**
 * Create a new order
 * @route POST /api/v1/order-card
 * @access Private
 */
const createOrder = asyncHandler(async (req, res, next) => {
  const { cartId, shippingAddress } = req.body;

  // Fetch cart and user
  const cart = await Cart.findById(cartId);
  if (!cart) return next(new ApiError("Cart not found", 404));
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  // Generate order number
  const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
  const newOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

  // Create order
  const order = new Order({
    orderNumber: newOrderNumber,
    user: user._id,
    cartItems: cart.products,
    shippingAddress,
    taxPrice: cart.taxPrice || 0,
    deliveryPrice: cart.deliveryPrice || 0,
    totalCartPrice: cart.totalCartPrice || 0,
    totalPrice: cart.totalPrice || 0,
  });
  await order.save();

  // Clear user's cart
  await Cart.findByIdAndDelete(cartId);
  await user.save();

  // Send confirmation email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: `My Company <${process.env.EMAIL_USER}>`,
    to: "abdoabdoyytt5678@gmail.com",
    subject: `🛍️ طلب جديد من ${user?.name}`,
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
            <p style="margin: 0; color: #555; display: inline-block;">${
              order.orderNumber
            }</p>
          </div>
          
          <!-- تفاصيل المنتجات -->
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">تفاصيل المنتجات:</h3>
            ${order.cartItems
              .map(
                (item) => `
              <div style="margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">اسم المنتج:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${
                  item.product.title
                }</p>
                <br />
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الكمية:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${
                  item.count || 1
                }</p>
                <br />
                <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">السعر:</p>
                <p style="margin: 0; color: #555; display: inline-block;">${
                  item.price || item.product.price
                }</p>
              </div>
            `
              )
              .join("")}
          </div>
          
          <!-- عنوان الشحن -->
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">عنوان الشحن:</h3>
            <div style="background-color: #f9f9f9; border-radius: 5px; padding: 10px; word-wrap: break-word;">
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الاسم المستعار:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${
                order.shippingAddress.alias
              }</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">العنوان:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${
                order.shippingAddress.details
              }</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">الهاتف:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${
                order.shippingAddress.phone
              }</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">المدينة:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${
                order.shippingAddress.city
              }</p>
              <br />
            </div>
          </div>
          
          <!-- التفاصيل المالية -->
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">التفاصيل المالية:</h3>
            <div style="background-color: #f9f9f9; border-radius: 5px; padding: 10px;">
              
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">تكلفة الشحن:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${
                order.deliveryPrice || 0
              }</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">قيمة الضريبة:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${
                order.taxPrice || 0
              }</p>
              <br />
              <p style="margin: 0; font-weight: bold; color: #0073e6; display: inline-block; width: 150px;">قيمة السلة:</p>
              <p style="margin: 0; color: #555; display: inline-block;">${
                order.totalCartPrice || 0
              }</p>
              <br />
            </div>
          </div>
          
          <!-- الإجمالي -->
          <div style="margin-top: 10px;">
            <p style="font-weight: bold; color: #d9534f; font-size: 22px; margin: 0; display: inline-block; width: 150px;">${
              order.paymentMethodType === "card" ? "" : "الإجمالي:"
            }</p>
            <p style="font-weight: bold; color: #d9534f; font-size: 22px; margin: 0; display: inline-block;">${
              order.paymentMethodType === "card"
                ? "تم الدفع بالبطاقة"
                : order.totalPrice || 0
            }</p>
          </div>
          
        </div>
      </body>
    </html>
  `,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) console.error("Error sending email:", error);
  });
  const redirectUrl = `http://localhost:3000/user/order?display=popup`;
  const merchantRedirectParam = encodeURIComponent(redirectUrl);
  // Generate Kashier payment URL
  const hash = generateKashierOrderHash(order);
  const paymentUrl = `https://payments.kashier.io/?merchantId=${MERCHANT_ID}&orderId=${
    order._id
  }&amount=${order.totalPrice.toFixed(2)}&currency=EGP&hash=${hash}&mode=${
    process.env.NODE_ENV === "production" ? "live" : "test"
  }&merchantRedirect=${merchantRedirectParam}`;

  res.status(201).json({
    status: "success",
    data: {
      order,
      paymentUrl,
    },
  });
});



module.exports = { createOrder };

// 4111 1111 1111 1111
// 12/30
// 123
