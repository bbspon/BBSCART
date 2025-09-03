const express = require("express");
const router = express.Router();
const adminVendorsController = require("../controllers/adminVendorsController");

// Credential flows (use :id consistently)
router.post(
  "/:id/create-credentials",
  adminVendorsController.createVendorCredentials
);
router.post(
  "/:id/resend-credentials",
  adminVendorsController.resendVendorCredentials
);

// Routes
router.get("/", adminVendorsController.listVendors);
router.get("/:id", adminVendorsController.getVendorById);

// Approve a vendor
router.post("/:id/approve", adminVendorsController.approveVendorRequest);
router.post("/seed-pincode-vendors", adminVendorsController.seedPincodeVendors);

module.exports = router;
