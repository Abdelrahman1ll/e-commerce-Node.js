const express = require("express");
const router = express.Router();
const {
  GetAllProductInCategory,
} = require("../controllers/AllProductInCategoryControllers");

// route to get all products in a specific category
router.route("/:id").get(GetAllProductInCategory);

module.exports = router;
