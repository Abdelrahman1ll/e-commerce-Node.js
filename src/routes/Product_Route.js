const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require("../controllers/Product_Controller");
const uploadImagesProduct = require("../controllers/uploads");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router
  .route("/")
  .post(
    verifyToken,
    authorize("admin"),
    // uploadImagesProduct,
    createProduct
  )
  .get(getProducts);

router
  .route("/:id")
  .put(
    verifyToken,
    authorize("admin"),
    // uploadImagesProduct,
    updateProduct
  )
  .get(getProductById);

module.exports = router;
