const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  createBbscartAccessToken,
  setBbscartCookie,
} = require("../middleware/authMiddleware");

const router = express.Router();

const POS_SSO_SECRET = process.env.POS_SSO_SECRET; // must match POS

router.get("/auth/pos-sso", async (req, res) => {
  try {
    const token = req.query?.token;
    if (!token) return res.redirect("/login");

    // Verify POS token. Short-lived (eg. 120s), signed by POS with POS_SSO_SECRET.
    const decoded = jwt.verify(token, POS_SSO_SECRET);
    const userId = decoded.sub;
    const role = decoded.role;

    if (!userId || role !== "seller") return res.redirect("/login");

    // Confirm seller exists and is active
    const dbUser = await User.findById(userId).select(
      "_id role vendor_id status"
    );
    if (!dbUser || dbUser.role !== "seller" || dbUser.status === "blocked") {
      return res.redirect("/login");
    }

    // Mint the normal BBSCART access token and set cookie
    const accessToken = createBbscartAccessToken(String(dbUser._id));
    setBbscartCookie(res, accessToken);

    // Clean URL and enter the dashboard
    return res.redirect("/admin/dashboard");
  } catch (err) {
    return res.redirect("/login");
  }
});

module.exports = router;
