const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  signupGoogle,
  verify,
  resendVerification,
  refreshToken
} = require("../controllers/Aouth_Controller");
const { verifyToken } = require("../middleware/verifyToken");

router.route("/signup").post(signup);

router.route("/verify/:token").get(verify);

router.route("/login").post(login);

router.route("/refresh").post(refreshToken);

router.route("/resend-verification").post(resendVerification);

router.route("/logout").post(verifyToken, logout);

router.route("/signup-google").post(signupGoogle);



module.exports = router;
