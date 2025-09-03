// controllers/franchiseeController.js
const path = require("path");
const mongoose = require("mongoose");
const Franchise = require("../models/FranchiseHead"); // reuse schema; tag role='franchisee_owner'
const Notification = require("../models/Notification") // if you already created one for vendors

/**
 * POST /upload  (no OCR)  -> { ok, fileUrl: /uploads/xxx.ext }
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ ok: false, message: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ ok: true, fileUrl });
  } catch (e) {
    console.error("franchisee.uploadDocument error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Upload failed", details: e.message });
  }
};

/**
 * POST/PATCH /step-by-key  (partial upsert)
 * Accepts the same body as your vendor flow. Creates/updates doc by _id without triggering required validators.
 * If no id provided, generates one and sets role='franchisee_owner' on insert.
 */
exports.saveStepByKey = async (req, res) => {
  try {
    const b = req.body || {};
    const id =
      b.franchiseeId && mongoose.Types.ObjectId.isValid(b.franchiseeId)
        ? b.franchiseeId
        : b.vendorId && mongoose.Types.ObjectId.isValid(b.vendorId)
          ? b.vendorId
          : new mongoose.Types.ObjectId();

    const set = { updated_at: new Date() };

    // Identity
    if (b.vendor_fname) set.vendor_fname = String(b.vendor_fname).trim();
    if (b.vendor_lname) set.vendor_lname = String(b.vendor_lname).trim();
    if (b.dob) set.dob = String(b.dob).trim();

    // PAN
    if (b.pan_number)
      set.pan_number = String(b.pan_number).trim().toUpperCase();
    if (b.pan_pic) set.pan_pic = String(b.pan_pic).trim();

    // Aadhaar
    if (b.aadhar_number) set.aadhar_number = String(b.aadhar_number).trim();
    if (b.aadhar_pic_front)
      set.aadhar_pic_front = String(b.aadhar_pic_front).trim();
    if (b.aadhar_pic_back)
      set.aadhar_pic_back = String(b.aadhar_pic_back).trim();

    // Registered/Business address
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

    const doc = await Franchise.findOneAndUpdate(
      { _id: id },
      {
        $set: set,
        $setOnInsert: { role: "franchisee_owner", created_at: new Date() },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: false,
      }
    );

    return res.json({ ok: true, data: doc, franchiseeId: doc._id });
  } catch (e) {
    console.error("franchisee.saveStepByKey error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Save failed", details: e.message });
  }
};

/**
 * Optional legacy: PATCH /:franchiseeId/step
 */
exports.saveStep = async (req, res) => {
  try {
    const { franchiseeId } = req.params;
    if (!franchiseeId)
      return res.status(400).json({ ok: false, message: "ID required" });
    const set = { ...(req.body || {}), updated_at: new Date() };
    const doc = await Franchise.findByIdAndUpdate(
      franchiseeId,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("franchisee.saveStep error:", e);
    res
      .status(500)
      .json({ ok: false, message: "Save failed", details: e.message });
  }
};

/**
 * PUT /gst  (multipart/form-data)
 */
exports.updateGst = async (req, res) => {
  try {
    const b = req.body || {};
    const id = (b.franchiseeId || b.vendorId || "").trim();
    if (!id)
      return res
        .status(400)
        .json({ ok: false, message: "franchiseeId required" });

    const set = { updated_at: new Date() };

    if (req.file) set.gst_cert_pic = `/uploads/${req.file.filename}`;
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

    const updated = await Franchise.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("franchisee.updateGst error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "GST update failed", details: e.message });
  }
};

/**
 * PUT /bank   and   PUT /:franchiseeId/bank  (multipart/form-data)
 */
exports.updateBankDetails = async (req, res) => {
  try {
    const id =
      req.params.franchiseeId || req.body.franchiseeId || req.body.vendorId;
    if (!id)
      return res.status(400).json({ ok: false, message: "ID is required" });

    const set = { updated_at: new Date() };
    if (req.file) set.cancel_cheque_passbook = `/uploads/${req.file.filename}`;

    const b = req.body || {};
    if (b.account_holder_name)
      set.account_holder_name = String(b.account_holder_name).trim();
    if (b.account_no) set.account_no = String(b.account_no).trim();
    if (b.ifcs_code) set.ifcs_code = String(b.ifcs_code).trim().toUpperCase();
    if (b.bank_name) set.bank_name = String(b.bank_name).trim();
    if (b.branch_name) set.branch_name = String(b.branch_name).trim();
    if (b.bank_address) set.bank_address = String(b.bank_address).trim();

    const updated = await Franchise.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("franchisee.updateBank error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Bank update failed", details: e.message });
  }
};

exports.updateBankByParam = async (req, res) => {
  req.body = req.body || {};
  req.body.franchiseeId = req.params.franchiseeId;
  return exports.updateBankDetails(req, res);
};

/**
 * PUT /outlet  (multipart/form-data)
 */
exports.updateOutlet = async (req, res) => {
  try {
    const b = req.body || {};
    const id = (b.franchiseeId || b.vendorId || "").trim();
    if (!id)
      return res
        .status(400)
        .json({ ok: false, message: "franchiseeId required" });

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

    if (req.file) set.outlet_nameboard_image = req.file.filename;

    const updated = await Franchise.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("franchisee.updateOutlet error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Outlet update failed", details: e.message });
  }
};

// Optional helper
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

/**
 * POST /register  – finalize
 */
exports.registerFranchisee = async (req, res) => {
  try {
    const id = req.body.franchiseeId || req.body.vendorId;
    if (!id)
      return res
        .status(400)
        .json({ ok: false, message: "franchiseeId required" });
    const updated = await Franchise.findByIdAndUpdate(
      id,
      {
        $set: { status: "submitted", updated_at: new Date() },
        $setOnInsert: { role: "franchisee_owner" },
      },
      { new: true, upsert: true, runValidators: false }
    );
    res
      .status(201)
      .json({
        ok: true,
        message: "Franchisee registered",
        franchisee: updated,
      });
  } catch (error) {
    console.error("franchisee.register error:", error);
    res
      .status(500)
      .json({
        ok: false,
        message: "Error registering franchisee",
        error: error.message,
      });
  }
};
exports.submitFranchiseApplication = async (req, res) => {
  try {
    const { franchiseeId } = req.body || {};
    if (!franchiseeId)
      return res
        .status(400)
        .json({ ok: false, message: "franchiseeId required" });

    const doc = await Franchise.findByIdAndUpdate(
      franchiseeId,
      { $set: { application_status: "submitted", submitted_at: new Date() } },
      { new: true }
    );
    if (!doc)
      return res
        .status(404)
        .json({ ok: false, message: "Franchisee not found" });

    // optional notification (if you have Notification model)
    try {
      await Notification?.create?.({
        type: "franchise_application",
        vendorId: doc._id, // reuse field name if your Notification uses vendorId
        title: "New Franchise Application",
        message: `Franchisee ${doc.vendor_fname || ""} ${doc.vendor_lname || ""} submitted application`,
      });
    } catch (_) {}

    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("franchisee.submit error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Submit failed", details: e.message });
  }
};

// --------------- Admin: list pending ---------------
// GET /api/franchisees/admin/requests
exports.listPendingFranchiseRequests = async (_req, res) => {
  try {
    const items = await Franchise.find({
      application_status: "submitted",
    }).select(
      "vendor_fname vendor_lname pan_number aadhar_number gst_number created_at submitted_at"
    );
    return res.json({ ok: true, data: items });
  } catch (e) {
    console.error("franchisee.listPending error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// --------------- Admin: get full ---------------
// GET /api/franchisees/admin/:franchiseeId
exports.getFranchiseFull = async (req, res) => {
  try {
    const { franchiseeId } = req.params;
    const doc = await Franchise.findById(franchiseeId);
    if (!doc)
      return res
        .status(404)
        .json({ ok: false, message: "Franchisee not found" });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("franchisee.getFull error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// --------------- Admin: approve/reject ---------------
// POST /api/franchisees/admin/:franchiseeId/decision  { decision: 'approve'|'reject', reason? }
exports.decideFranchise = async (req, res) => {
  try {
    const { franchiseeId } = req.params;
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

    const updated = await Franchise.findByIdAndUpdate(
      franchiseeId,
      { $set: updates },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ ok: false, message: "Franchisee not found" });

    // optional notification
    try {
      await Notification?.create?.({
        type: "franchise_application",
        vendorId: updated._id,
        title: "Franchise Reviewed",
        message: `Franchisee ${updated.vendor_fname || ""} ${updated.vendor_lname || ""} ${decision}`,
      });
    } catch (_) {}

    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("franchisee.decide error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Decision failed", details: e.message });
  }
};

// --------------- Admin: list page (approved list) ---------------
// GET /api/franchisees/admin/franchisees?status=approved&q=&page=1&limit=20&sort=-updatedAt
exports.listFranchisees = async (req, res) => {
  try {
    const {
      status = "approved",
      q = "",
      page = 1,
      limit = 20,
      sort = "-updatedAt",
    } = req.query;

    const filter = {};
    if (status && status !== "all") filter.application_status = status;

    if (q) {
      const rx = new RegExp(q, "i");
      filter.$or = [
        { vendor_fname: rx },
        { vendor_lname: rx },
        { pan_number: rx },
        { gst_number: rx },
        { aadhar_number: rx },
        { "register_business_address.city": rx },
        { "register_business_address.state": rx },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, parseInt(limit, 10) || 20);

    const total = await Franchise.countDocuments(filter);
    const rows = await Franchise.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .select(
        "vendor_fname vendor_lname pan_number aadhar_number gst_number register_business_address application_status is_active submitted_at updated_at"
      );

    return res.json({
      ok: true,
      data: rows,
      meta: { page: pageNum, limit: pageSize, total },
    });
  } catch (e) {
    console.error("franchisee.list error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
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
  registerFranchisee: exports.registerFranchisee,
  submitFranchiseApplication: exports.submitFranchiseApplication,
  listPendingFranchiseRequests: exports.listPendingFranchiseRequests,
  getFranchiseFull: exports.getFranchiseFull,
  decideFranchise: exports.decideFranchise,
  listFranchisees: exports.listFranchisees,
};
