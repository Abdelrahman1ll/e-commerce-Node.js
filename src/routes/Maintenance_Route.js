const express = require("express");
const router = express.Router();
const {
  getAllMaintenances,
  getUserMaintenance,
  createMaintenance,
  deleteMaintenance,
} = require("../controllers/Maintenance_Controller");

const { verifyToken, authorize } = require("../middleware/verifyToken");
const {
  uploadSingleImage,
  resizeAndUploadSingleImage,
} = require("../controllers/Upload_Google");

router.route("/user").get(verifyToken, authorize("user"), getUserMaintenance);

router.route("/:id").delete(verifyToken, authorize("admin"), deleteMaintenance);

router
  .route("/")
  .get(verifyToken, authorize("admin"), getAllMaintenances)
  .post(
    verifyToken,
    authorize("user"),
    uploadSingleImage,
    resizeAndUploadSingleImage,
    createMaintenance
  );

module.exports = router;
