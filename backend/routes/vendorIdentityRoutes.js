const express = require("express");
const router = express.Router();

const upload = require("../middleware/vendorIdentityUpload");
const {
  getVendorIdentity,
  updateVendorIdentity,
} = require("../controllers/vendorIdentityController");

// GET vendor identity card
router.get("/:vendorId", getVendorIdentity);

// UPDATE vendor identity (with photo + signature)
router.put(
  "/:vendorId",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateVendorIdentity
);

module.exports = router;
