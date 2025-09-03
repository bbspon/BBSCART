// controllers/territoryHeadController.js
const path = require("path");
const mongoose = require("mongoose");
const TerritoryHead = require("../models/TerritoryHead"); // parallel to your FranchiseHead model

// POST /upload  -> { ok, fileUrl: /uploads/xxx.ext }  (no OCR)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ ok: false, message: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ ok: true, fileUrl });
  } catch (e) {
    console.error("territoryHead.uploadDocument error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Upload failed", details: e.message });
  }
};

// POST/PATCH /step-by-key (partial upsert; bypass required validators on partial steps)
exports.saveStepByKey = async (req, res) => {
  try {
    const b = req.body || {};
    const id =
      b.territoryHeadId && mongoose.Types.ObjectId.isValid(b.territoryHeadId)
        ? b.territoryHeadId
        : b.franchiseeId && mongoose.Types.ObjectId.isValid(b.franchiseeId)
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

    const doc = await TerritoryHead.findOneAndUpdate(
      { _id: id },
      {
        $set: set,
        $setOnInsert: { role: "territory_head_owner", created_at: new Date() },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: false,
      }
    );

    return res.json({ ok: true, data: doc, territoryHeadId: doc._id });
  } catch (e) {
    console.error("territoryHead.saveStepByKey error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Save failed", details: e.message });
  }
};

// Optional legacy: PATCH /:territoryHeadId/step
exports.saveStep = async (req, res) => {
  try {
    const { territoryHeadId } = req.params;
    if (!territoryHeadId)
      return res.status(400).json({ ok: false, message: "ID required" });
    const set = { ...(req.body || {}), updated_at: new Date() };
    const doc = await TerritoryHead.findByIdAndUpdate(
      territoryHeadId,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("territoryHead.saveStep error:", e);
    res
      .status(500)
      .json({ ok: false, message: "Save failed", details: e.message });
  }
};

// PUT /gst  (multipart/form-data)
exports.updateGst = async (req, res) => {
  try {
    const b = req.body || {};
    const id = (b.territoryHeadId || b.franchiseeId || b.vendorId || "").trim();
    if (!id)
      return res
        .status(400)
        .json({ ok: false, message: "territoryHeadId required" });

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

    const updated = await TerritoryHead.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("territoryHead.updateGst error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "GST update failed", details: e.message });
  }
};

// PUT /bank   and   PUT /:territoryHeadId/bank  (multipart/form-data)
exports.updateBankDetails = async (req, res) => {
  try {
    const id =
      req.params.territoryHeadId ||
      req.body.territoryHeadId ||
      req.body.franchiseeId ||
      req.body.vendorId;
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

    const updated = await TerritoryHead.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("territoryHead.updateBank error:", e);
    return res
      .status(500)
      .json({ ok: false, message: "Bank update failed", details: e.message });
  }
};

exports.updateBankByParam = async (req, res) => {
  req.body = req.body || {};
  req.body.territoryHeadId = req.params.territoryHeadId;
  return exports.updateBankDetails(req, res);
};

// PUT /outlet (multipart/form-data)
exports.updateOutlet = async (req, res) => {
  try {
    const b = req.body || {};
    const id = (b.territoryHeadId || b.franchiseeId || b.vendorId || "").trim();
    if (!id)
      return res
        .status(400)
        .json({ ok: false, message: "territoryHeadId required" });

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

    const updated = await TerritoryHead.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: false }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    return res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("territoryHead.updateOutlet error:", e);
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

// POST /register – finalize
exports.registerTerritoryHead = async (req, res) => {
  try {
    const id =
      req.body.territoryHeadId || req.body.franchiseeId || req.body.vendorId;
    if (!id)
      return res
        .status(400)
        .json({ ok: false, message: "territoryHeadId required" });
    const updated = await TerritoryHead.findByIdAndUpdate(
      id,
      {
        $set: { status: "submitted", updated_at: new Date() },
        $setOnInsert: { role: "territory_head_owner" },
      },
      { new: true, upsert: true, runValidators: false }
    );
    res
      .status(201)
      .json({
        ok: true,
        message: "Territory Head registered",
        territoryHead: updated,
      });
  } catch (error) {
    console.error("territoryHead.register error:", error);
    res
      .status(500)
      .json({
        ok: false,
        message: "Error registering territory head",
        error: error.message,
      });
  }
};
// POST /register – finalize submit for review
exports.registerTerritoryHead = async (req, res) => {
  try {
    const id = req.body.territoryHeadId || req.body.franchiseeId || req.body.vendorId;
    if (!id) return res.status(400).json({ ok: false, message: "territoryHeadId required" });

    const updated = await TerritoryHead.findByIdAndUpdate(
      id,
      {
        $set: { application_status: "submitted", submitted_at: new Date(), updated_at: new Date() },
        $setOnInsert: { role: "territory_head" },
      },
      { new: true, upsert: true, runValidators: false }
    );
    res.status(201).json({ ok: true, message: "Territory Head submitted for review", territoryHead: updated });
  } catch (error) {
    console.error("territoryHead.register error:", error);
    res.status(500).json({ ok: false, message: "Error submitting territory head", error: error.message });
  }
};
const buildSearch = (q) => {
  if (!q) return {};
  const like = new RegExp(String(q).trim(), "i");
  return {
    $or: [
      { vendor_fname: like },
      { vendor_lname: like },
      { pan_number: like },
      { aadhar_number: like },
      { gst_number: like },
      { "register_business_address.city": like },
      { "register_business_address.state": like },
    ],
  };
};

// GET /admin/requests  -> pending submissions
exports.listPendingRequests = async (req, res) => {
  try {
    const q = req.query.q || "";
    const filter = {
      application_status: "submitted",
      is_decline: { $ne: true },
    };
    const list = await TerritoryHead.find({ ...filter, ...buildSearch(q) })
      .sort({ submitted_at: -1 })
      .limit(200);
    res.json({ ok: true, data: list });
  } catch (e) {
    console.error("territoryHead.listPendingRequests error:", e);
    res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// GET /admin/territories?status=approved&q=&page=1&limit=20
exports.listTerritories = async (req, res) => {
  try {
    const { status = "approved", q = "", page = 1, limit = 20 } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, Math.min(200, parseInt(limit, 10)));

    const filter = status === "all" ? {} : { application_status: status };
    const where = { ...filter, ...buildSearch(q) };

    const [rows, total] = await Promise.all([
      TerritoryHead.find(where)
        .sort({ updated_at: -1 })
        .skip((p - 1) * l)
        .limit(l),
      TerritoryHead.countDocuments(where),
    ]);

    res.json({ ok: true, data: rows, meta: { total, page: p, limit: l } });
  } catch (e) {
    console.error("territoryHead.listTerritories error:", e);
    res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// GET /admin/:id -> full record
exports.getTerritoryFull = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await TerritoryHead.findById(id);
    if (!doc) return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, data: doc });
  } catch (e) {
    console.error("territoryHead.getTerritoryFull error:", e);
    res
      .status(500)
      .json({ ok: false, message: "Fetch failed", details: e.message });
  }
};

// POST /admin/:id/decision { decision: "approve"|"reject", reason? }
exports.decideTerritory = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body || {};
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ ok: false, message: "Invalid decision" });
    }

    const set = { updated_at: new Date() };
    if (decision === "approve") {
      set.application_status = "approved";
      set.is_active = true;
      set.is_decline = false;
      set.approved_at = new Date();
      set.decline_reason = null;
      // Optional: create login account + email here if you follow your vendor flow
      // await createUserAndEmailCredentials(...)
    } else {
      set.application_status = "rejected";
      set.is_active = false;
      set.is_decline = true;
      set.decline_reason = String(reason || "").slice(0, 500);
    }

    const updated = await TerritoryHead.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, data: updated });
  } catch (e) {
    console.error("territoryHead.decide error:", e);
    res
      .status(500)
      .json({ ok: false, message: "Decision failed", details: e.message });
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
  registerTerritoryHead: exports.registerTerritoryHead,
  decideTerritory: exports.decideTerritory,
  getTerritoryFull: exports.getTerritoryFull,
  listTerritories: exports.listTerritories,
  listPendingRequests: exports.listPendingRequests,
  
};
