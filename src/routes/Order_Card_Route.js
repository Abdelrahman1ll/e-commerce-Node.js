const express = require("express");
const router = express.Router();
const {
  createOrderCard,
  webhook,
  isPaid,
} = require("../controllers/Order_Card_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router
  .route("/order-card")
  .post(verifyToken, authorize("user"), createOrderCard);

router.route("/paymob/webhook").post(webhook);

router.route("/is-paid/:id").put(verifyToken, authorize("admin"), isPaid);

module.exports = router;
