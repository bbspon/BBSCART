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
const Vendor = require("../models/Vendor"); // path that matches your project
const { getOrCreateAssignment } = require("../services/vendorAssignService");

// module.exports = async function requireAssignedVendor(req, res, next) {
//   try {
//     // 1) Use explicit pincode first, THEN defaults
//     const headerPin =
//       req.headers["x-delivery-pincode"] || req.headers["x-pincode"];
//     const bodyPin =
//       req.body?.shippingAddress?.postalCode ||
//       req.body?.pincode ||
//       req.query?.pincode;
//     const userDefaultPin = req.user?.default_pincode;

//     const pincode = String(headerPin || bodyPin || userDefaultPin || "").trim();

//     if (!pincode) {
//       return res.status(400).json({ message: "pincode is required" });
//     }

//     // 2) Accept either _id or userId from auth; else guest-key
//     const customerKey = String(
//       req.user?._id || req.user?.userId || req.headers["x-guest-key"] || ""
//     );

//     if (!customerKey) {
//       return res
//         .status(401)
//         .json({ message: "customer or guest key required" });
//     }

//     // 3) Try the existing service first
//     let doc;
//     try {
//       doc = await getOrCreateAssignment({ customerKey, pincode });
//     } catch (e) {
//       console.warn(
//         "getOrCreateAssignment failed, will try direct map:",
//         e?.message
//       );
//     }

//     // 4) If service didn’t return a vendor userId, fall back to direct mapping
//     let assignedVendorUserId = doc?.userId;
//     if (!assignedVendorUserId) {
//       // Find pincode → vendorIds
//       const map = await PincodeVendors.findOne({ pincode, active: true });
//       if (!map || !Array.isArray(map.vendorIds) || map.vendorIds.length === 0) {
//         return res.status(400).json({ message: "Assigned vendor missing" });
//       }

//       // Pick the first active vendor; read its user_id
//       const vendor = await Vendor.findOne({
//         _id: map.vendorIds[0],
//         is_active: true,
//       });
//       assignedVendorUserId = vendor?.user_id?.toString();
//       req.assignedVendorId = vendor._id.toString(); // Vendor id
//       req.assignedVendorUserId = vendor.user_id?.toString(); // User id (optional)

//       if (!assignedVendorUserId) {
//         return res.status(400).json({ message: "Assigned vendor missing" });
//       }
//     }

//     // 5) Attach to request

//     req.assignedVendorId = assignedVendorUserId;
//     req.assignedPincode = pincode;

//     // also pass to body if your controller reads from body
//     req.body.assignedVendorId = assignedVendorUserId;

//     return next();
//   } catch (err) {
//     console.error("requireAssignedVendor error:", err);
//     return res.status(500).json({ message: err.message || "Assignment middleware error" });
//   }
// };
module.exports = async function requireAssignedVendor(req, res, next) {
  try {
    // 1) Use explicit pincode first, THEN defaults
    const headerPin =
      req.headers["x-delivery-pincode"] || req.headers["x-pincode"];
    const bodyPin =
      req.body?.shippingAddress?.postalCode ||
      req.body?.pincode ||
      req.query?.pincode;
    const userDefaultPin = req.user?.default_pincode;

    const pincode = String(headerPin || bodyPin || userDefaultPin || "").trim();
    if (!pincode) {
      return res.status(400).json({ message: "pincode is required" });
    }

    // 2) Accept either _id or userId from auth; else guest-key
    const customerKey = String(
      req.user?._id || req.user?.userId || req.headers["x-guest-key"] || ""
    );
    if (!customerKey) {
      return res
        .status(401)
        .json({ message: "customer or guest key required" });
    }

    // 3) Try the existing service first
    let vendorDoc = null;
    try {
      const doc = await getOrCreateAssignment({ customerKey, pincode }); // expect { vendorId, ... }
      if (doc?.vendorId) {
        vendorDoc = await Vendor.findOne({
          _id: doc.vendorId,
          is_active: true,
        });
      }
    } catch (e) {
      console.warn(
        "getOrCreateAssignment failed, will try direct map:",
        e?.message
      );
    }

    // 4) If service didn’t return a vendor, fall back to direct mapping
    if (!vendorDoc) {
      const map = await PincodeVendors.findOne({ pincode, active: true });
      if (!map || !Array.isArray(map.vendorIds) || map.vendorIds.length === 0) {
        return res.status(400).json({ message: "Assigned vendor missing" });
      }

      // Pick first active vendor in mapping (or implement your rotation)
      vendorDoc = await Vendor.findOne({
        _id: map.vendorIds[0],
        is_active: true,
      });
      if (!vendorDoc) {
        return res.status(400).json({ message: "Assigned vendor missing" });
      }
    }

    // 5) Attach to request (use Vendor._id as the assignedVendorId)
    req.assignedVendorId = vendorDoc._id.toString(); // Vendor _id (matches Product.seller_id)
    req.assignedVendorUserId = vendorDoc.user_id?.toString() || null; // optional
    req.assignedPincode = pincode;
    req.body.assignedVendorId = req.assignedVendorId; // keep Vendor _id in body too

    // Optional debug
    // console.log("Assigned vendor:", {
    //   pincode,
    //   assignedVendorId: req.assignedVendorId,
    //   assignedVendorUserId: req.assignedVendorUserId
    // });

    return next();
  } catch (err) {
    console.error("requireAssignedVendor error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Assignment middleware error" });
  }
};
