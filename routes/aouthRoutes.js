const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  signupGoogle,
} = require("../controllers/aouthController");
const { verifyToken } = require("../middleware/verifyToken");

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").post(verifyToken, logout);

router.route("/signup-google").post(signupGoogle);

module.exports = router;
