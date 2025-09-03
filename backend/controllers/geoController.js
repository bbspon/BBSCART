// controllers/geoController.js
const Vendor = require("../models/Vendor");

const { getOrCreateAssignment } = require("../services/vendorAssignService");
const assignVendorMiddleware = require("../middleware/assignVendorMiddleware");
function setCookie(res, name, value, days = 30) {
  res.cookie(name, value, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}
exports.assignVendor = async (req, res) => {
  try {
    const { pincode } = req.body || {};
    if (!pincode)
      return res.status(400).json({ message: "pincode is required" });

    const customerKey =
      req.user?.userId || req.headers["x-guest-key"] || req.body.customerId;
    if (!customerKey)
      return res.status(400).json({ message: "customerKey is required" });

    const doc = await getOrCreateAssignment({
      customerKey: String(customerKey),
      pincode: String(pincode),
    });
    res.json({
      vendorId: doc.vendorId,
      pincode: doc.pincode,
      dateKey: doc.dateKey,
      expiresAt: doc.expiresAt,
    });
  } catch (err) {
    console.error("assignVendor error:", err);
    res.status(500).json({ message: err.message || "Assignment error" });
  }
};
// POST /api/geo/pincode  { pincode }
exports.setPincode = async (req, res) => {
  try {
    const { pincode } = req.body || {};
    if (!pincode) return res.status(400).json({ success: false, message: "pincode required" });

    // store for later requests
    setCookie(res, "pincode", String(pincode), 30);

    // prime the assignment middleware to run now
    req.assignedPincode = String(pincode);

    await new Promise((resolve) => assignVendorMiddleware(req, res, resolve));

    if (!req.assignedVendorId) {
      return res.json({
        success: true,
        assigned: null,
        message: "No approved vendor found for this pincode",
      });
    }

    const vendor = await Vendor.findById(req.assignedVendorId)
      .select({ display_name: 1, legal_name: 1 })
      .lean();

    return res.json({
      success: true,
      assigned: {
        vendorId: String(req.assignedVendorId),
        vendorName: vendor?.display_name || vendor?.legal_name || "Vendor",
        pincode: String(pincode),
      },
    });
  } catch (err) {
    console.error("setPincode error:", err);
    return res.status(500).json({ success: false, message: "failed to set pincode" });
  }
};