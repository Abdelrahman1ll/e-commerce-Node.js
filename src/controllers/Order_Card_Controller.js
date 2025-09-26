const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const { Order } = require("../models/Order_Model");
const { User } = require("../models/User_Model");
const { Cart } = require("../models/Cart_Model");
const nodemailer = require("nodemailer");
const axios = require("axios");
// في موشكله في ال IFrame paymob انا مش عارف اجيبها
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.INTEGRATION_ID;
const HMAC_SECRET = process.env.HMAC_SECRET;
let authToken = "";
/**
 * Create a new order
 * @route POST /api/order-card
 * @access Private
 */

// ✅ 1- Authentication
async function authenticate() {
  const response = await axios.post(
    "https://accept.paymob.com/api/auth/tokens",
    {
      api_key: PAYMOB_API_KEY,
    }
  );
  authToken = response.data.token;
  return authToken;
}

// ✅ 2- Create Order
async function createOrder(amountCents, currency = "EGP") {
  const response = await axios.post(
    "https://accept.paymob.com/api/ecommerce/orders",
    {
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: amountCents,
      currency: currency,
      items: [],
    }
  );
  return response.data;
}

// ✅ 3- Payment Key Request
async function getPaymentKey(orderId, amountCents, billingData) {
  const response = await axios.post(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: INTEGRATION_ID,
    }
  );
  return response.data.token;
}

const createOrderCard = asyncHandler(async (req, res, next) => {
  const { cartId, shippingAddress } = req.body;

  // Fetch cart and user
  const cart = await Cart.findById(cartId);
  if (!cart) return next(new ApiError("Cart not found", 404));
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const newOrderNumber = Math.floor(100000 + Math.random() * 900000);

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

  // 1- Authenticate
  await authenticate();

  // 2- Create Order
  const createdOrder = await createOrder(order.totalPrice * 100);

  // 3- Billing data (لازم تبعته حسب المتطلبات)
  const billingData = {
    apartment: "NA",
    email: user.email,
    floor: "NA",
    first_name: user.name,
    last_name: user.lastName,
    street: "NA",
    building: "NA",
    phone_number: user.phone,
    city: "Cairo",
    country: "EG",
    state: "NA",
  };

  // 4- Get Payment Key
  const paymentToken = await getPaymentKey(
    createdOrder.id,
    order.totalPrice * 100,
    billingData
  );

  // 5- Build Redirect URL (صفحة الدفع)
  const redirectURL = `https://accept.paymob.com/api/acceptance/iframes/${INTEGRATION_ID}?payment_token=${paymentToken}`;

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
    redirectURL,
  });
});

// ✅ Helper: Verify HMAC signature
function verifyHmac(data, hmac) {
  const orderedKeys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const concatenated = orderedKeys
    .map((key) => {
      const keys = key.split(".");
      let value = data;
      keys.forEach((k) => {
        if (value) value = value[k];
      });
      return value !== undefined && value !== null ? value.toString() : "";
    })
    .join("");

  const generatedHmac = crypto
    .createHmac("sha512", HMAC_SECRET)
    .update(concatenated)
    .digest("hex");

  return generatedHmac === hmac;
}

// ✅ Webhook endpoint
const webhook = asyncHandler(async (req, res, next) => {
  const { obj, hmac } = req.body;

  if (!obj || !hmac) {
    return next(new ApiError("Invalid request", 400));
  }

  // تحقق من صحة البيانات
  const isValid = verifyHmac(obj, hmac);

  if (!isValid) {
    return next(new ApiError("HMAC verification failed", 400));
  }

  if (obj.success) {
    // العملية ناجحة
    const order = await Order.findById(obj.order.id);

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
      await order.save();
    }
  } else {
    return next(new ApiError("Payment failed", 400));
  }
});

const isPaid = asyncHandler(async (req, res, next) => {
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
    status: "success",
  });
});

module.exports = {
  createOrderCard,
  webhook,
  isPaid,
};
