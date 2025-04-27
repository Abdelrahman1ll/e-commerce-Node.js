const express = require("express");
const { sendResetCode, verifyResetCode, resetPassword } = require("../controllers/ForgotPasswordController");
const router = express.Router();

router.route("/forgot-password").post(sendResetCode);

router.route("/reset-code").post(verifyResetCode);

router.route("/reset-password").post(resetPassword);

module.exports = router;