const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  getAllOrdersByUser,
  updateOrderDeliveryStatus,
  updateOrderPaymentStatus,
} = require("../controllers/Order_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");



router.route("/user").get(verifyToken, authorize("user"), getAllOrdersByUser);

router
  .route("/:id/deliver")
  .put(verifyToken, authorize("admin"), updateOrderDeliveryStatus);

router
  .route("/:id/pay")
  .put(verifyToken, authorize("admin"), updateOrderPaymentStatus);

router
  .route("/:id")
  .get(verifyToken, authorize("admin"), getOrderById)

router
  .route("/")
  .get(verifyToken, authorize("admin"), getAllOrders)
  .post(verifyToken, authorize("user"), createOrder);
module.exports = router;
