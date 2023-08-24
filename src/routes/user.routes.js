const express = require("express");
const router = express.Router();
const {
  getLoginPage,
  loginUser,
  getRegisterPage,
  registerUser,
  logout,
  getProfile,
  getChangePassword,
  changePassword,
  getChangeInfo,
  changeInfo,
} = require("../controllers/user.controller");

router.get("/sign-in", getLoginPage);
router.post("/sign-in", loginUser);
router.get("/sign-up", getRegisterPage);
router.post("/sign-up", registerUser);
router.get("/profile", getProfile);
router.get("/change-password", getChangePassword);
router.post("/change-password", changePassword);
router.get("/change-info", getChangeInfo);
router.post("/change-info", changeInfo);
router.get("/logout", logout);

module.exports = router;
