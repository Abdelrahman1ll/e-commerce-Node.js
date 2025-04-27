const express = require("express");
const router = express.Router();
const {
  UpdateUser,
  getAllUsers,
  deleteUser,
  changePassword,
} = require("../controllers/userControllers");

const { verifyToken, authorize } = require("../middleware/verifyToken");

router.route("/:id").put(verifyToken, authorize("user"), UpdateUser);

router.route("/").get(verifyToken, authorize("admin"), getAllUsers);

router.route("/:id").delete(verifyToken, authorize("admin"), deleteUser);

router
  .route("/forgot-password/:id")
  .put(verifyToken, authorize("user"), changePassword);

module.exports = router;
