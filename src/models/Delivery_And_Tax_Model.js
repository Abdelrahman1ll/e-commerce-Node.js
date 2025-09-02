// models/Settings.js
const mongoose = require("mongoose");

const DeliveryTaxSchema = mongoose.Schema({
  deliveryPrice: {
    type: Number,
    default: 0,
  },
  taxPrice: {
    type: Number,
    default: 0,
  }
});


const DeliveryTax = mongoose.model("Settings", DeliveryTaxSchema);

module.exports = { DeliveryTax };