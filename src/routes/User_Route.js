const express = require("express");
const router = express.Router();
const {
  UpdateUser,
  getAllUsers,
  deleteUser,
  changePassword,
} = require("../controllers/User_Controller");

const { verifyToken, authorize } = require("../middleware/verifyToken");

router.route("/:id").put(verifyToken, authorize("user"), UpdateUser);

router.route("/").get(verifyToken, authorize("admin"), getAllUsers);

router.route("/:id").delete(verifyToken, authorize("user"), deleteUser);

router
  .route("/forgot-password/:id")
  .put(verifyToken, changePassword);

module.exports = router;
