const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { Order } = require("../models/Order_Model");
const { User } = require("../models/User_Model");
const { Cart } = require("../models/Cart_Model");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const axios = require("axios");

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
/**
 * Create a new order
 * @route POST /api/order-card
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

   // Step A: Get auth_token from Paymob
  const authResp = await axios.post("https://accept.paymob.com/api/auth/tokens", {
    api_key: PAYMOB_API_KEY,
  });
  const authToken = authResp.data.token;

  // Step B: Create order in Paymob
  const orderResp = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
    auth_token: authToken,
    delivery_needed: "false",
    amount_cents: order.totalPrice * 100, // بالقرش
    currency: "EGP",
    items: order.cartItems.map((item) => ({
      name: item.product.title,
      amount_cents: item.price * 100,
      description: "Product",
      quantity: item.count,
    })),
  });
  const paymobOrderId = orderResp.data.id;

  // Step C: Get payment key
  const payKeyResp = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
    auth_token: authToken,
    amount_cents: order.totalPrice * 100,
    expiration: 3600,
    order_id: paymobOrderId,
    billing_data: {
      first_name: user.name?.split(" ")[0] || "First",
      last_name: user.name?.split(" ")[1] || "Last",
      email: user.email,
      phone_number: shippingAddress.phone,
      apartment: "NA",
      floor: "NA",
      street: shippingAddress.details,
      building: "NA",
      city: shippingAddress.city,
      country: "EG",
      state: "NA",
    },
    currency: "EGP",
    integration_id: parseInt(INTEGRATION_ID),
  });
  const paymentToken = payKeyResp.data.token;

  // Step D: Build iframe URL (use PAYMOB_IFRAME_ID not INTEGRATION_ID)
  const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

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

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    return next(new ApiError("Failed to send email", 502));
  }

  res.status(201).json({
    status: "success",
    data: order,
    iframeURL,
  });
});

module.exports = { createOrder };

// 4111 1111 1111 1111
// 12/30
// 123
