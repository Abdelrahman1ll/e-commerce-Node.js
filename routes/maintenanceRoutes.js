const express = require("express");
const router = express.Router();
const {
  getAllMaintenances,
  getUserMaintenance,
  createMaintenance,
  deleteMaintenance,
} = require("../controllers/maintenanceControllers");

const { verifyToken, authorize } = require("../middleware/verifyToken");
const {
  MaintenanceImage,
  uploadProductImages,
} = require("../controllers/upload");

router.route("/user").get(verifyToken, authorize("user"), getUserMaintenance);

router.route("/:id").delete(verifyToken, authorize("admin"), deleteMaintenance);

router
  .route("/")
  .get(verifyToken, authorize("admin"), getAllMaintenances)
  .post(
    verifyToken,
    authorize("user"),
    uploadProductImages,
    MaintenanceImage,
    createMaintenance
  );

module.exports = router;
