const express = require("express");
const router = express.Router();
const {
  GetAllCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/Off_Site_Customers_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");
router
  .route("/")
  .get(verifyToken, authorize("admin"), GetAllCustomer)
  .post(verifyToken, authorize("admin"), createCustomer);

router
  .route("/:id")
  .put(verifyToken, authorize("admin"), updateCustomer)
  .delete(verifyToken, authorize("admin"), deleteCustomer);

module.exports = router;
