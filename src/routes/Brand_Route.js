const express = require("express");
const router = express.Router();
const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/Brand_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router
  .route("/")
  .get(getBrands)
  .post(verifyToken, authorize("admin"), createBrand);

router
  .route("/:id")
  .put(verifyToken, authorize("admin"), updateBrand)
  .delete(verifyToken, authorize("admin"), deleteBrand)
  .get(getBrandById);

module.exports = router;
