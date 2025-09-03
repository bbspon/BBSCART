// routes/geoRoutes.js
const express = require("express");
const router = express.Router();
const { assignVendor } = require("../controllers/geoController");
const validatePincode = require("../middleware/validatePincode");
const geo = require("../controllers/geoController");

// Optional: let both guests and logged-in users call this.
// If you want to allow guests, do not attach authUser here. Keep it open.
router.post("/assign", validatePincode, assignVendor);
router.post("/pincode", geo.setPincode);

module.exports = router;
