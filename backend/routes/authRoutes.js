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
  createAdminInvite,
  acceptAdminInvite,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/authController");
const { auth, superAdminOnly } = require("../middleware/authMiddleware");
const { uploadAny } = require("../middleware/upload");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", sendPasswordResetEmail);
router.post("/reset-password/:token", resetPassword);

// Protected user/account endpoints
router.post("/logout", auth, logout);
router.get("/check-auth", auth, checkAuth);
router.put("/update-profile",auth, uploadAny, updateProfile);
router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);
router.get("/me", getUser);
router.post("/refresh-token", authRefershToken);

// PUBLIC vendor set-password flow (fixes 401)
router.get("/vendors/verify-token/:token", verifySetPasswordToken);
router.post("/vendors/set-password", setPassword);

// --- new invite routes --- //
router.post("/admin-invites", auth, superAdminOnly, createAdminInvite);
router.post("/admin-invites/accept", acceptAdminInvite);

module.exports = router;
