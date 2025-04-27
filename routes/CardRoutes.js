const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/OrderCardController");
const { verifyToken, authorize } = require("../middleware/verifyToken");
const {kashierWebhook } = require('../controllers/webhookController');

router.route("/order-card").post(verifyToken,createOrder);

// إضافة مسار الويب هوك الخاص بـ Kashier
router.post(
  '/kashier-webhook',
  express.raw({ type: 'application/json' }), // لمعالجة البيانات الخام
  kashierWebhook
);




module.exports = router;
