const express = require("express");
const router = express.Router();

const upload = require("../middleware/customerVendorUpload");
const {
  createCustomerVendor,
  getByVendorId,
} = require("../controllers/customerBecomeVendorController");

router.post(
  "/",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "shopPhoto", maxCount: 1 },
    { name: "idProofFront", maxCount: 1 },
    { name: "idProofBack", maxCount: 1 },
    { name: "signature", maxCount: 1 }, // ✅ FIX HERE
  ]),
  createCustomerVendor
);

router.get("/:vendorId", getByVendorId);

module.exports = router;
