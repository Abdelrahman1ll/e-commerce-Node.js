const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  UpdateReview,
  deleteReview,
} = require("../controllers/Review_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router.route("/").post(verifyToken, authorize("user"), createReview);

// All reviews for this product
router.route("/product/:id").get(getProductReviews);

router
  .route("/:id")
  .put(verifyToken, authorize("user"), UpdateReview)
  .delete(verifyToken, deleteReview);

module.exports = router;
