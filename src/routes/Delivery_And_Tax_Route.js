const express = require("express");
const router = express.Router();

const {
  DeliveryAndTax,
  getOeneDeliveryAndTax,
} = require("../controllers/Delivery_And_Tax_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router.route("/").post(verifyToken, authorize("admin"), DeliveryAndTax);

router.route("/").get(verifyToken, getOeneDeliveryAndTax);

module.exports = router;
