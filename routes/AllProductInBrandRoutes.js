const express = require("express");
const router = express.Router();
const {
  GetAllProductInBrand,
} = require("../controllers/AllProductInBrandControllers");

// Get all products in a specific brand
router.route("/:id").get(GetAllProductInBrand);

module.exports = router;
