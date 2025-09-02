const express = require("express");
const router = express.Router();
const {
  GetAllProductInBrand,
} = require("../controllers/All_Product_In_Brand_Controller");


router.route("/:id").get(GetAllProductInBrand);

module.exports = router;
