const express = require("express");
const router = express.Router();

const {
  createAddress,
  addAddressUpdate,
  getAllAddresses,
  deleteAddress,
} = require("../controllers/addAddressController");

const { verifyToken, authorize } = require("../middleware/verifyToken");

router
  .route("/")
  .get(verifyToken, authorize("user"), getAllAddresses)
  .post(verifyToken, authorize("user"), createAddress);

router
  .route("/:id")
  .delete(verifyToken, authorize("user"), deleteAddress)
  .put(verifyToken, authorize("user"), addAddressUpdate);

module.exports = router;
