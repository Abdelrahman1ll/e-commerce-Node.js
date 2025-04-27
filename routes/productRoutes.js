const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require("../controllers/productControllers");
const {
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/upload");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router
  .route("/")
  .post(
    verifyToken,
    authorize("admin"),
    uploadProductImages,
    resizeProductImages,
    createProduct
  )
  .get(getProducts);

router
  .route("/:id")
  .put(
    verifyToken,
    authorize("admin"),
    uploadProductImages,
    resizeProductImages,
    updateProduct
  )
  .get(getProductById);

module.exports = router;
