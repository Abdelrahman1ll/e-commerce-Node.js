const { Order } = require("../models/Order_Model");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const querystring = require("querystring");

const _ = require("underscore");

const kashierWebhook = asyncHandler(async (req, res) => {
  const { data, event } = req.body;
  data.signatureKeys.sort();

  const objectSignaturePayload = _.pick(data, data.signatureKeys);
  const signaturePayload = querystring.stringify(objectSignaturePayload);
  const signature = crypto

    .createHmac("sha256", PaymentApiKey)

    .update(signaturePayload)

    .digest("hex");
  const kashierSignature = req.header("x-kashier-signature");
  if (kashierSignature === signature) {
    if (event === "payment.success") {
      // اتأكد ان ال payment نجحت
      const orderId = data.orderId; // المفروض orderId يكون مرسل منك عند انشاء الطلب
      const order = await Order.findById(orderId);

      if (order) {
        order.isPaid = true;
        order.paymentMethodType = "card";
        await order.save();
      }
    }

    console.log("valid signature");
  } else {
    console.log("invalid signature");
  }
});

module.exports = { kashierWebhook };

// تعديل الاسم والكود