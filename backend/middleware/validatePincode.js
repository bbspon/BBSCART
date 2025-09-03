const PincodeVendors = require("../models/PincodeVendors");

module.exports = async function validatePincode(req, res, next) {
  try {
    const pin =
      req.body?.pincode ||
      req.headers["x-pincode"] ||
      req.query?.pincode ||
      req.user?.default_pincode;

    if (!pin || !/^\d{6}$/.test(String(pin))) {
      return res
        .status(400)
        .json({ message: "Valid 6-digit pincode is required" });
    }

    const cfg = await PincodeVendors.findOne({
      pincode: String(pin),
      active: true,
    })
      .select("_id vendorIds pausedVendorIds")
      .lean();

    if (!cfg || !cfg.vendorIds?.length) {
      return res
        .status(400)
        .json({ message: "Service not available for this pincode" });
    }

    req.validatedPincode = String(pin);
    next();
  } catch (e) {
    console.error("validatePincode error", e);
    res.status(500).json({ message: "Pincode validation error" });
  }
};
