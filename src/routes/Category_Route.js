const express = require("express");
const router = express.Router();
const {
  GetAllCategory,
  GetCategoryById,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
} = require("../controllers/Category_Controller");
const { verifyToken, authorize } = require("../middleware/verifyToken");

router
  .route("/")
  .get(GetAllCategory)
  .post(verifyToken, authorize("admin"), CreateCategory);

router
  .route("/:id")
  .put(verifyToken, authorize("admin"), UpdateCategory)
  .delete(verifyToken, authorize("admin"), DeleteCategory)
  .get(GetCategoryById);

module.exports = router;
