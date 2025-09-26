const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} = require("../controllers/Product_Controller");
// const {
//   uploadProductImages,
//   resizeProductImages,
//   uploadImagesToDrive,
// } = require("../controllers/Upload_Google");
const {
  uploadProductImages,
  resizeProductImages,
  uploadImagesToCloudinary,
} = require("../controllers/Upload_Cloudinary");
const { verifyToken, authorize } = require("../middleware/verifyToken");
// في موشكله في Google Drive
router
  .route("/")
  .post(
    verifyToken,
    authorize("admin"),
    uploadProductImages,
    resizeProductImages,
    uploadImagesToCloudinary,
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
    uploadImagesToCloudinary,
    updateProduct
  )
  .get(getProductById);

module.exports = router;
