// routes/adminPincodeVendorsRoutes.js
const express = require("express");
const router = express.Router();

const PincodeVendors = require("../models/PincodeVendors");

// ✅ Fix: use correct names from authMiddleware.js
const { auth, adminOnly } = require("../middleware/authMiddleware");

// ✅ Lock all routes behind auth + admin
router.use(auth, adminOnly);

// GET /api/admin/pincode-vendors
router.get("/", async (req, res) => {
  try {
    const list = await PincodeVendors.find().lean();
    res.json(list);
  } catch (e) {
    console.error("GET /api/admin/pincode-vendors error", e);
    res.status(500).json({ message: "Failed to fetch pincode vendors" });
  }
});

// POST /api/admin/pincode-vendors
router.post("/", async (req, res) => {
  try {
    const {
      pincode,
      vendorIds,
      active = true,
      pausedVendorIds = [],
      dailyStartOffset = 0,
    } = req.body;

    if (!pincode || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res
        .status(400)
        .json({ message: "pincode and vendorIds[] are required" });
    }

    const doc = await PincodeVendors.findOneAndUpdate(
      { pincode: String(pincode) },
      {
        pincode: String(pincode),
        vendorIds,
        active: Boolean(active),
        pausedVendorIds,
        dailyStartOffset: Number(dailyStartOffset) || 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(doc);
  } catch (e) {
    console.error("POST /api/admin/pincode-vendors error", e);
    res.status(500).json({ message: "Failed to upsert pincode vendors" });
  }
});

module.exports = router;
