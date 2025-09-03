const express = require("express");
const {
  register,
  login,
  sendPasswordResetEmail,
  resetPassword,
  setPassword,
  logout,
  checkAuth,
  updateProfile,
  getUser,
  authRefershToken,
  verifySetPasswordToken,
} = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");
const { uploadAny } = require("../middleware/upload");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", sendPasswordResetEmail);
router.post("/reset-password/:token", resetPassword);

// Protected user/account endpoints
router.post("/logout", auth, logout);
router.get("/check-auth", auth, checkAuth);
router.put("/update-profile", uploadAny, updateProfile);
router.get("/me", getUser);
router.post("/refresh-token", authRefershToken);

// PUBLIC vendor set-password flow (fixes 401)
router.get("/vendors/verify-token/:token", verifySetPasswordToken);
router.post("/vendors/set-password",setPassword);

module.exports = router;
