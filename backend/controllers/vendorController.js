// controllers/vendorController.js
const mongoose = require("mongoose");
const Vendor = require("../models/Vendor");
// controllers/vendorController.js (add to the bottom)
const Notification = require("../models/Notification");

/**
 * Generic file upload handler (no OCR).
 * Expects multer to have placed the file at req.file.
 * Returns a stable /uploads/<filename> URL.
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ ok: true, fileUrl });
  } catch (e) {
    console.error("uploadDocument error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Upload failed", details: e.message });
  }
};

/**
 * Save arbitrary step payloads. Upserts vendor if needed.
 * Body may include:
 * - vendorId (optional)
 * - pan_number, pan_pic
 * - vendor_fname, vendor_lname, dob
 * - aadhar_number, aadhar_pic_front, aadhar_pic_back
 * - register_business_address: { street, city, state, country, postalCode }
 */
exports.saveStepByKey = async (req, res) => {
  try {
    const b = req.body || {};
    const id =
      b.vendorId && mongoose.Types.ObjectId.isValid(b.vendorId)
        ? b.vendorId
        : new mongoose.Types.ObjectId();

    const set = { updated_at: new Date() };

    if (b.vendor_fname) set.vendor_fname = String(b.vendor_fname).trim();
    if (b.vendor_lname) set.vendor_lname = String(b.vendor_lname).trim();
    if (b.dob) set.dob = String(b.dob).trim();
    if (b.email) set.email = String(b.email).trim();

    if (b.pan_number)
      set.pan_number = String(b.pan_number).trim().toUpperCase();
    if (b.pan_pic) set.pan_pic = String(b.pan_pic).trim();

    if (b.aadhar_number) set.aadhar_number = String(b.aadhar_number).trim();
    if (b.aadhar_pic_front)
      set.aadhar_pic_front = String(b.aadhar_pic_front).trim();
    if (b.aadhar_pic_back)
      set.aadhar_pic_back = String(b.aadhar_pic_back).trim();

    if (
      b.register_business_address &&
      typeof b.register_business_address === "object"
    ) {
      const addr = b.register_business_address;
      ["street", "city", "state", "country", "postalCode"].forEach((k) => {
        const v = addr[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          set[`register_business_address.${k}`] = String(v).trim();
        }
      });
    }

    const doc = await Vendor.findOneAndUpdate(
      { _id: id },
      { $set: set },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: false,
      }
    );

    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("saveStepByKey error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Save failed", details: e.message });
  }
};

/**
 * Optional legacy route: PATCH /:vendorId/step
 */
exports.saveStep = async (req, res) => {
  try {
    const { vendorId } = req.params;
    if (!vendorId)
      return res.status(400).json({ ok: false, message: "Vendor ID required" });

    const set = { ...(req.body || {}), updated_at: new Date() };
    const doc = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!doc)
      return res.status(404).json({ ok: false, message: "Vendor not found" });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("saveStep error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Save failed", details: e.message });
  }
};

/**
 * PUT /gst  (multipart/form-data)
 * Accepts vendorId in body, optional file at field "document".
 * Also accepts gst_number, gst_legal_name, gst_constitution,
 * and gst_address fields (either nested or bracket notation).
 */
exports.updateGst = async (req, res) => {
  try {
    const b = req.body || {};
    const vendorId = (b.vendorId || "").trim();
    if (!vendorId) {
      return res.status(400).json({ ok: false, message: "vendorId required" });
    }

    const set = { updated_at: new Date() };

    if (req.file) {
      set.gst_cert_pic = `/uploads/${req.file.filename}`;
    }

    if (b.gst_number)
      set.gst_number = String(b.gst_number).trim().toUpperCase();
    if (b.gst_legal_name) set.gst_legal_name = String(b.gst_legal_name).trim();
    if (b.gst_constitution)
      set.gst_constitution = String(b.gst_constitution).trim();

    const g = b.gst_address || {};
    const keys = [
      "floorNo",
      "buildingNo",
      "street",
      "locality",
      "city",
      "district",
      "state",
      "postalCode",
    ];
    for (const k of keys) {
      const v = g[k] ?? b[`gst_address[${k}]`];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        set[`gst_address.${k}`] = String(v).trim();
      }
    }

    const updated = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Vendor not found" });

    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("updateGst error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "GST update failed", details: e.message });
  }
};

/**
 * PUT /bank and PUT /:vendorId/bank  (multipart/form-data)
 * Accepts vendorId via req.params or req.body, optional file at "document".
 */
exports.updateBankDetails = async (req, res) => {
  try {
    const vendorId = req.params.vendorId || req.body.vendorId;
    if (!vendorId) {
      return res
        .status(400)
        .json({ ok: false, message: "Vendor ID is required" });
    }

    const set = { updated_at: new Date() };

    if (req.file) {
      set.cancel_cheque_passbook = `/uploads/${req.file.filename}`;
    }

    const b = req.body || {};
    if (b.account_holder_name)
      set.account_holder_name = String(b.account_holder_name).trim();
    if (b.account_no) set.account_no = String(b.account_no).trim();
    if (b.ifcs_code) set.ifcs_code = String(b.ifcs_code).trim().toUpperCase();
    if (b.bank_name) set.bank_name = String(b.bank_name).trim();
    if (b.branch_name) set.branch_name = String(b.branch_name).trim();
    if (b.bank_address) set.bank_address = String(b.bank_address).trim();

    const updated = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Vendor not found" });

    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("updateBank error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Bank update failed", details: e.message });
  }
};

exports.updateBankByParam = async (req, res) => {
  req.body = req.body || {};
  req.body.vendorId = req.params.vendorId;
  return exports.updateBankDetails(req, res);
};

/**
 * PUT /outlet (multipart/form-data)
 * Body:
 *  - vendorId
 *  - outlet_name, outlet_manager_name, outlet_contact_no, outlet_phone_no
 *  - outlet_location[street|city|district|state|country|postalCode]
 *  - outlet_coords[lat|lng]
 *  - outlet_nameboard_image (file)
 */
exports.updateOutlet = async (req, res) => {
  try {
    const b = req.body || {};
    const vendorId = (b.vendorId || "").trim();
    if (!vendorId) {
      return res.status(400).json({ ok: false, message: "vendorId required" });
    }

    const set = { updated_at: new Date() };

    if (b.outlet_name) set.outlet_name = String(b.outlet_name).trim();
    if (b.outlet_manager_name)
      set.outlet_manager_name = String(b.outlet_manager_name).trim();
    if (b.outlet_contact_no)
      set.outlet_contact_no = String(b.outlet_contact_no).trim();
    if (b.outlet_phone_no)
      set.outlet_phone_no = String(b.outlet_phone_no).trim();

    if (b.outlet_location && typeof b.outlet_location === "object") {
      const a = b.outlet_location;
      ["street", "city", "district", "state", "country", "postalCode"].forEach(
        (k) => {
          const v = a[k];
          if (v !== undefined && v !== null && String(v).trim() !== "") {
            set[`outlet_location.${k}`] = String(v).trim();
          }
        }
      );
    }

    if (b.outlet_coords && typeof b.outlet_coords === "object") {
      const { lat, lng } = b.outlet_coords;
      if (lat !== undefined && lat !== null)
        set["outlet_coords.lat"] = Number(lat);
      if (lng !== undefined && lng !== null)
        set["outlet_coords.lng"] = Number(lng);
    }

    if (req.file) {
      // store filename only (your existing UI builds /uploads/<filename> URLs)
      set.outlet_nameboard_image = req.file.filename;
    }

    const updated = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: set },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Vendor not found" });

    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("updateOutlet error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Outlet update failed", details: e.message });
  }
};

// Optional helper middleware if you validate geolocation elsewhere
exports.validateGeolocation = (req, res, next) => {
  const { lat, lng } = req.body.outlet_coords || {};
  if (lat === undefined || lng === undefined) {
    return res
      .status(400)
      .json({ ok: false, message: "Latitude and longitude are required." });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res
      .status(400)
      .json({ ok: false, message: "Invalid latitude or longitude." });
  }
  next();
};

exports.registerVendor = async (req, res) => {
  try {
    const vendorData = req.body;
    const vendor = new Vendor(vendorData);
    await vendor.save();
    res
      .status(201)
      .json({ ok: true, message: "Vendor registered successfully", vendor });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, message: "Error registering vendor", error });
  }
};

// controllers/vendorController.js (add this)
exports.submitApplication = async (req, res) => {
  try {
    const { vendorId } = req.body || {};
    if (!vendorId) {
      return res.status(400).json({ ok: false, message: "vendorId required" });
    }

    const updated = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: { application_status: "submitted", submitted_at: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ ok: false, message: "Vendor not found" });
    }

    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("submitApplication error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Submit failed", details: e.message });
  }
};

// GET /api/vendors/admin/requests?status=pending
exports.listPendingVendorRequests = async (_req, res) => {
  try {
    const docs = await Vendor.find({ application_status: "submitted" }).select(
      "vendor_fname vendor_lname pan_number aadhar_number gst_number created_at submitted_at"
    );
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error("listPendingVendorRequests error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// GET /api/vendors/admin/:vendorId
exports.getVendorFull = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const doc = await Vendor.findById(vendorId);
    if (!doc)
      return res.status(404).json({ ok: false, message: "Vendor not found" });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("getVendorFull error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// POST /api/vendors/admin/:vendorId/decision
// body: { decision: 'approve' | 'reject', reason?: string }
exports.decideVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { decision, reason } = req.body || {};
    const updates = { updated_at: new Date() };

    if (decision === "approve") {
      updates.application_status = "approved";
      updates.is_active = true;
      updates.is_decline = false;
      updates.decline_reason = null;
    } else if (decision === "reject") {
      updates.application_status = "rejected";
      updates.is_active = false;
      updates.is_decline = true;
      updates.decline_reason = reason || "Not specified";
    } else {
      return res.status(400).json({ ok: false, message: "Invalid decision" });
    }

    const updated = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updates },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Vendor not found" });

    await Notification.create({
      type: "vendor_application",
      vendorId: updated._id,
      title: "Vendor Reviewed",
      message: `Vendor ${updated.vendor_fname || ""} ${updated.vendor_lname || ""} ${decision}`,
    });

    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("decideVendor error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Decision failed", details: e.message });
  }
};

// GET /api/vendors/admin/notifications
exports.getNotifications = async (_req, res) => {
  try {
    const items = await Notification.find({ is_read: false })
      .sort({ created_at: -1 })
      .limit(20);
    return res.json({ ok: true, data: items });
  } catch (e) {
    console.error("getNotifications error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// POST /api/vendors/admin/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findByIdAndUpdate(
      id,
      { $set: { is_read: true } },
      { new: true }
    );
    if (!n) return res.status(404).json({ ok: false, message: "Not found" });
    return res.json({ ok: true, data: n });
  } catch (e) {
    console.error("markNotificationRead error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Update failed", details: e.message });
  }
};

exports.listVendors = async (req, res) => {
  try {
    const { status = "approved", q = "", page = 1, limit = 20 } = req.query;
    const match = {};

    if (status && status !== "all") {
      match.application_status = status;
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      match.$or = [
        { vendor_fname: regex },
        { vendor_lname: regex },
        { brand_name: regex },
        { pan_number: regex },
        { gst_number: regex },
        { "register_business_address.city": regex },
        { "register_business_address.state": regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // IMPORTANT: do NOT select both the parent object and its children.
    // Select only the dotted children you need; never the parent as a whole.
    const vendors = await Vendor.find(match)
      .select(
        [
          "vendor_fname",
          "vendor_lname",
          "brand_name",
          "email",
          "user_id",
          "application_status",
          "updated_at",
          "pan_number",
          "gst_number",
          "register_business_address.city",
          "register_business_address.state",
          "register_business_address.postalCode",
        ].join(" ")
      )
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Vendor.countDocuments(match);

    return res.json({
      success: true,
      vendors,
      meta: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error("listVendors error", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
exports.startApplication = async (_req, res) => {
  try {
    const doc = await Vendor.create({
      application_status: "draft",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("startApplication error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Start failed", details: e.message });
  }
};
module.exports = {
  uploadDocument: exports.uploadDocument,
  saveStepByKey: exports.saveStepByKey,
  saveStep: exports.saveStep,
  updateGst: exports.updateGst,
  updateBankDetails: exports.updateBankDetails,
  updateBankByParam: exports.updateBankByParam,
  updateOutlet: exports.updateOutlet,
  validateGeolocation: exports.validateGeolocation,
  registerVendor: exports.registerVendor,
  submitApplication: exports.submitApplication, // <— add this line
  listPendingVendorRequests: exports.listPendingVendorRequests,
  getVendorFull: exports.getVendorFull,
  decideVendor: exports.decideVendor,
  markNotificationRead: exports.markNotificationRead,
  getNotifications: exports.getNotifications,
  listVendors: exports.listVendors,
  startApplication:exports.startApplication, // <— add this line
};
