const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  createBbscartAccessToken,
  setBbscartCookie,
} = require("../middleware/authMiddleware");

const router = express.Router();
// helper: choose landing path (keep vendor or admin, your call)
function landingPathForRole(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'seller') return '/admin/dashboard';    // or keep '/admin/dashboard'
  if (r === 'admin')  return '/admin/dashboard';
  return '/';
}

router.get('/auth/pos-sso', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.redirect('/login');

    const decoded = jwt.verify(token, process.env.POS_SSO_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 5,
    });

    const userId = decoded.sub || decoded.userId || decoded.id;
    if (!userId) return res.redirect('/login');

    // Look up user (and ensure active seller)
    let dbUser = await User.findById(userId).select('_id email role vendor_id status');
    if (!dbUser && decoded.email) {
      dbUser = await User.findOne({ email: decoded.email }).select('_id email role vendor_id status');
    }
    if (!dbUser || dbUser.status === 'blocked') return res.redirect('/login');

    // Issue your normal auth cookie
    const accessToken = createBbscartAccessToken(String(dbUser._id));
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      domain: process.env.NODE_ENV === 'production' ? '.bbscart.com' : undefined,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Decide landing
    const landing = landingPathForRole(dbUser.role);

    // ✅ NEW: bootstrap localStorage, then redirect
    const bootstrapUser = {
      _id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
      vendor_id: dbUser.vendor_id || null,
      status: dbUser.status,
    };

    return res
      .status(200)
      .set('Content-Type', 'text/html; charset=utf-8')
      .send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Signing you in…</title></head>
<body>
<script>
try {
  // Clear stale keys
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  // Write fresh values expected by your Sidebar
  localStorage.setItem('user', ${JSON.stringify(JSON.stringify(bootstrapUser))});
  localStorage.setItem('role', ${JSON.stringify(String(dbUser.role).toLowerCase())});
} catch (e) { /* ignore */ }
// Now move to the correct dashboard
location.replace(${JSON.stringify(landing)});
</script>
</body></html>`);
  } catch (err) {
    console.error('SSO ROUTE ERROR:', err);
    return res.redirect('/login');
  }
});


module.exports = router;
