// // middleware/requireAssignedVendor.js
// const { getOrCreateAssignment } = require("../services/vendorAssignService");

// module.exports = async function requireAssignedVendor(req, res, next) {
//   try {
//     // Ensure pincode exists
//     const pincode =
//       req.user?.default_pincode ||
//       req.headers["x-pincode"] ||
//       req.headers["x-delivery-pincode"] ||
//       req.query.pincode ||
//       req.body?.pincode ||
//       req.body?.shippingAddress?.postalCode;

//     if (!pincode)
//       return res.status(400).json({ message: "pincode is required" });

//     // Ensure customerKey exists
//     const customerKey = req.user?.userId || req.headers["x-guest-key"];
//     if (!customerKey)
//       return res
//         .status(401)
//         .json({ message: "customer or guest key required" });

//     // Fetch or create assignment
//     const doc = await getOrCreateAssignment({
//       customerKey: String(customerKey),
//       pincode: String(pincode),
//     });

//     // Validate that assignment returned a vendor
//     if (!doc || !doc.userId) {
//       return res.status(400).json({ message: "Assigned vendor missing" });
//     }

//     // Attach assigned info to request
//     req.assignedVendorId = doc.userId;
//     req.assignedPincode = doc.pincode;
//     req.assignedDateKey = doc.dateKey;

//     next();
//   } catch (err) {
//     console.error("requireAssignedVendor error:", err);
//     res
//       .status(500)
//       .json({ message: err.message || "Assignment middleware error" });
//   }
// };
// middleware/requireAssignedVendor.js
const PincodeVendors = require("../models/PincodeVendors");
const Vendor = require("../models/Vendor");
const {
  getOrCreateAssignment,
} = require("../services/vendorAssignService");

// ------------------------------------------------------
//  FIXED + CLEANED requireAssignedVendor MIDDLEWARE
// ------------------------------------------------------
module.exports = async function requireAssignedVendor(req, res, next) {
  try {
    // 1) Extract PINCODE (Correct Order – Header → Body → User default)
    const headerPin =
      req.headers["x-delivery-pincode"] || req.headers["x-pincode"];

    const bodyPin =
      req.body?.deliveryPincode ||
      req.body?.shippingAddress?.postalCode ||
      req.body?.pincode;

    const userDefaultPin = req.user?.default_pincode;

    const pincode = String(headerPin || bodyPin || userDefaultPin || "").trim();

    if (!pincode) {
      return res.status(400).json({ message: "pincode is required" });
    }

    // 2) Determine customer identification
    const customerKey = String(
      req.user?._id || req.user?.userId || req.headers["x-guest-key"] || ""
    );

    if (!customerKey) {
      return res
        .status(401)
        .json({ message: "customer or guest key required" });
    }

    // 3) Try automated vendor assignment
    let vendorDoc = null;

    try {
      const doc = await getOrCreateAssignment({ customerKey, pincode });

      if (doc?.vendorId) {
        vendorDoc = await Vendor.findOne({
          _id: doc.vendorId,
          is_active: true,
        });
      }
    } catch (err) {
      console.warn(
        "⚠ vendorAssignmentService failed → trying direct pincode map:",
        err.message
      );
    }

    // 4) Fallback: get vendor from PincodeVendors map
    if (!vendorDoc) {
      const map = await PincodeVendors.findOne({ pincode, active: true });

      if (map?.vendorIds?.length) {
        vendorDoc = await Vendor.findOne({
          _id: map.vendorIds[0],
          is_active: true,
        });
      }

      // 5) Fallback: no pincode mapping — use any active vendor, or any vendor if none active (so checkout works)
      if (!vendorDoc) {
        vendorDoc = await Vendor.findOne({ is_active: true }).sort({ updated_at: -1 });
        if (!vendorDoc) {
          vendorDoc = await Vendor.findOne().sort({ updated_at: -1 });
          if (vendorDoc) {
            console.warn(
              "[VENDOR] No active vendor → using any vendor for pincode",
              pincode,
              "vendorId=",
              vendorDoc._id
            );
          }
        } else {
          console.warn(
            "[VENDOR] No mapping for pincode",
            pincode,
            "→ using fallback vendor",
            vendorDoc._id
          );
        }
      }

      if (!vendorDoc) {
        return res.status(400).json({
          message:
            "Assigned vendor missing. Add at least one vendor (Admin → Vendors) and optionally map pincodes in Admin → Pincode Vendors.",
        });
      }
    }

    // 5) Inject vendor details into req
    req.assignedVendorId = vendorDoc._id.toString();
    req.assignedVendorUserId = vendorDoc.user_id?.toString() || null;
    req.assignedPincode = pincode;

    // Also put it into body for controller access
    req.body.assignedVendorId = req.assignedVendorId;

    // --------------------------
    // FIXED DEBUG LOGS
    // --------------------------
    console.log(
      "[VENDOR] IN:",
      new Date().toISOString(),
      "pincode=",
      req.assignedPincode,
      "assignedVendorId=",
      req.assignedVendorId
    );

    return next();
  } catch (err) {
    console.error("❌ requireAssignedVendor error:", err);
    return res.status(500).json({
      message: err.message || "Assignment middleware error",
    });
  }
};