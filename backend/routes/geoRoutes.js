// routes/geoRoutes.js
const express = require("express");
const router = express.Router();
const { assignVendor } = require("../controllers/geoController");
const validatePincode = require("../middleware/validatePincode");
const geo = require("../controllers/geoController");

// Optional: let both guests and logged-in users call this.
// If you want to allow guests, do not attach authUser here. Keep it open.
// geoRoutes.js (assign)
router.post('/assign', (req, res) => {
  const pin = String(req.body?.pincode || '').trim();
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ message: 'Invalid pincode' });
  }
  res.cookie('pincode', pin, {
    httpOnly: false, sameSite: 'lax', maxAge: 30*24*60*60*1000, path: '/'
  });
  return res.json({ ok: true, pincode: pin });
});
router.post("/pincode", geo.setPincode);

module.exports = router;
