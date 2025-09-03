const asyncHandler = require("express-async-handler");
const { DeliveryTax } = require("../models/Delivery_And_Tax_Model");
/**
 * @desc   Update delivery and tax
 * @route   /api/delivery-tax
 * @method  POST
 * @access  Private
 */
const DeliveryAndTax = asyncHandler(async (req, res, next) => {
  const { deliveryPrice, taxPrice } = req.body;
  // تحديث الإعدادات: يمكن إنشاء سجل جديد إذا لم يكن موجوداً
  let deliveryTax = await DeliveryTax.findOne();
  if (!deliveryTax) {
    deliveryTax = new DeliveryTax({ deliveryPrice, taxPrice });
  } else {
    if (deliveryPrice === undefined || deliveryPrice === 0) {
      deliveryTax.deliveryPrice = deliveryTax.deliveryPrice;
    } else {
      deliveryTax.deliveryPrice = deliveryPrice;
    }

    if (taxPrice === undefined || taxPrice === 0) {
      deliveryTax.taxPrice = deliveryTax.taxPrice;
    } else {
      deliveryTax.taxPrice = taxPrice;
    }
  }
  await deliveryTax.save();
  res.status(200).json({ data: deliveryTax, status: "success" });
});

/**
 * @desc   Get delivery and tax
 * @route   /api/delivery-tax
 * @method  GET
 * @access  Private
 */
const getOeneDeliveryAndTax = asyncHandler(async (req, res, next) => {
  const deliveryTax = await DeliveryTax.findOne();
  
  res.status(200).json({ data: deliveryTax, status: "success" });
});
module.exports = { DeliveryAndTax, getOeneDeliveryAndTax };
