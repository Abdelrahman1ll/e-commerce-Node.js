const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require("../controllers/productControllers");
const { uploadImagesToDrive,uploadProductImages,resizeProductImages } = require("../controllers/uploadGoogle");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router
  .route("/")
  .post(
    verifyToken,
    authorize("admin"),
    uploadProductImages,
    resizeProductImages,
    uploadImagesToDrive,
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
    uploadImagesToDrive,
    updateProduct
  )
  .get(getProductById);

module.exports = router;
