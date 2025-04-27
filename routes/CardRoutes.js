const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/OrderCardController");
const { verifyToken, authorize } = require("../middleware/verifyToken");
// const { kashierWebhook } = require("../controllers/webhookController");

router.route("/order-card").post(verifyToken, createOrder);

// إضافة مسار الويب هوك الخاص بـ Kashier
// router.route("/kashier-webhook").post(kashierWebhook);

module.exports = router;
