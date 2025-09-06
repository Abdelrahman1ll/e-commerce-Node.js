const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/Order_Card_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");
// const { kashierWebhook } = require("../controllers/Change_Order_Status_Controller");

router.route("/order-card").post(verifyToken, authorize("user"), createOrder);

// إضافة مسار الويب هوك الخاص بـ Kashier
// router.route("/").post(kashierWebhook);

module.exports = router;
