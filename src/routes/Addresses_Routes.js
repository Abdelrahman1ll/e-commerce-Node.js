const express = require("express");
const router = express.Router();

const {
  createAddress,
  addAddressUpdate,
  getAllAddresses,
  deleteAddress,
} = require("../controllers/Addresses_Controller");

// Middleware for token verification and authorization
const { verifyToken, authorize } = require("../middleware/verifyToken");

// Routes for address management
router
  .route("/")
  .get(verifyToken, authorize("user"), getAllAddresses)
  .post(verifyToken, authorize("user"), createAddress);

// Route for updating an address
router
  .route("/:id")
  .delete(verifyToken, authorize("user"), deleteAddress)
  .put(verifyToken, authorize("user"), addAddressUpdate);

module.exports = router;
