const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/Order_Card_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router.route("/order-card").post(verifyToken, authorize("user"), createOrder);

module.exports = router;
