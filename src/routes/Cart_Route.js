const express = require("express");
const router = express.Router();
const { verifyToken, authorize } = require("../middleware/verifyToken");
const {
  addToCart,
  getCart,
  removeCartProduct,
  clearLoggedUserCart,
  updateCartProductCount,
} = require("../controllers/Cart_Controller");

router
  .route("/")
  .post(verifyToken, authorize("user"), addToCart)
  .get(verifyToken, authorize("user"), getCart)
  .delete(verifyToken, authorize("user"), clearLoggedUserCart);

router
  .route("/:id")
  .delete(verifyToken, authorize("user"), removeCartProduct)
  .put(verifyToken, authorize("user"), updateCartProductCount);

module.exports = router;
