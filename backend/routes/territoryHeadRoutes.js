// routes/territoryHeadRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const territoryHeadController = require("../controllers/territoryHeadController");

// Try project upload middleware, else fallback to basic multer
let uploadModule;
try {
  uploadModule = require("../middleware/upload");
} catch (e) {
  try {
    uploadModule = require("../upload");
  } catch (_e2) {
    uploadModule = null;
  }
}
let upload = uploadModule?.upload || uploadModule;
if (!upload) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "uploads/"),
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
  upload = multer({ storage });
}

// Root probe
router.get("/", (_req, res) =>
  res.json({ ok: true, msg: "territory-heads root" })
);

// Simple upload (no OCR). Field: "document"
router.post(
  "/upload",
  upload.single("document"),
  territoryHeadController.uploadDocument
);

// Step save (partial upsert)
router.post("/step-by-key", territoryHeadController.saveStepByKey);
router.patch("/step-by-key", territoryHeadController.saveStepByKey);
// ===== Admin endpoints (place BEFORE '/admin/:id'!) =====
router.get("/admin/requests", territoryHeadController.listPendingRequests);
router.get("/admin/territories", territoryHeadController.listTerritories);
router.get("/admin/:id", territoryHeadController.getTerritoryFull);
router.post("/admin/:id/decision", territoryHeadController.decideTerritory);

// Optional legacy
router.patch("/:territoryHeadId/step", territoryHeadController.saveStep);

// GST
router.put(
  "/gst",
  upload.single("document"),
  territoryHeadController.updateGst
);

// Bank
router.put(
  "/bank",
  upload.single("document"),
  territoryHeadController.updateBankDetails
);
router.put(
  "/:territoryHeadId/bank",
  upload.single("document"),
  territoryHeadController.updateBankByParam
);

// Outlet (restrict to images up to 5MB)
const outletStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const uploadOutlet = multer({
  storage: outletStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) && allowed.test(mime)) return cb(null, true);
    return cb(new Error("Only JPG, JPEG, PNG allowed"));
  },
});

router.put(
  "/outlet",
  uploadOutlet.single("outlet_nameboard_image"),
  territoryHeadController.updateOutlet
);

// Finalize
router.post("/register", territoryHeadController.registerTerritoryHead);

module.exports = router;
