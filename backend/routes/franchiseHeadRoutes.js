// routes/franchiseeRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const franchiseeController = require("../controllers/franchiseHeadController");

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
router.get("/", (_req, res) => res.json({ ok: true, msg: "franchisees root" }));

// Simple upload (no OCR). Field: "document"
router.post(
  "/upload",
  upload.single("document"),
  franchiseeController.uploadDocument
);

// Step save (partial upsert)
router.post("/step-by-key", franchiseeController.saveStepByKey);
router.patch("/step-by-key", franchiseeController.saveStepByKey);
// franchiseHeadRoutes.js  (ADD)

// Final submit
router.post("/submit", franchiseeController.submitFranchiseApplication);

// --- Admin: list first (static) ---
router.get("/admin/requests", franchiseeController.listPendingFranchiseRequests);
router.get("/admin/franchisees", franchiseeController.listFranchisees);

// Admin: details and decision (dynamic) - keep AFTER static paths
router.get("/admin/:franchiseeId", franchiseeController.getFranchiseFull);
router.post("/admin/:franchiseeId/decision", franchiseeController.decideFranchise);

// Optional legacy
router.patch("/:franchiseeId/step", franchiseeController.saveStep);

// GST
router.put("/gst", upload.single("document"), franchiseeController.updateGst);

// Bank
router.put(
  "/bank",
  upload.single("document"),
  franchiseeController.updateBankDetails
);
router.put(
  "/:franchiseeId/bank",
  upload.single("document"),
  franchiseeController.updateBankByParam
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
  franchiseeController.updateOutlet
);

// Finalize
router.post("/register", franchiseeController.registerFranchisee);

module.exports = router;
