// routes/agentHeadRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const agentHeadController = require("../controllers/agentController");

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
router.get("/", (_req, res) => res.json({ ok: true, msg: "agent-heads root" }));

// Simple upload (no OCR). Field: "document"
router.post(
  "/upload",
  upload.single("document"),
  agentHeadController.uploadDocument
);

// Step save (partial upsert)
router.post("/step-by-key", agentHeadController.saveStepByKey);
router.patch("/step-by-key", agentHeadController.saveStepByKey);
router.get(
  "/agent/requests",
  /*requireAuth, requireAdmin,*/ agentHeadController.listRequests
);
router.get(
  "/agent/requests/:id",
  /*requireAuth, requireAdmin,*/ agentHeadController.getRequestById
);
router.post(
  "/agent/approve/:id",
  /*requireAuth, requireAdmin,*/ agentHeadController.approve
);
router.post(
  "/agent/reject/:id",
  /*requireAuth, requireAdmin,*/ agentHeadController.reject
);
router.get(
  "/agents",
  /*requireAuth, requireAdmin,*/ agentHeadController.listApproved
);
// Optional legacy
router.patch("/:agentHeadId/step", agentHeadController.saveStep);

// GST
router.put("/gst", upload.single("document"), agentHeadController.updateGst);

// Bank
router.put(
  "/bank",
  upload.single("document"),
  agentHeadController.updateBankDetails
);
router.put(
  "/:agentHeadId/bank",
  upload.single("document"),
  agentHeadController.updateBankByParam
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
  agentHeadController.updateOutlet
);

// Finalize
router.post("/register", agentHeadController.registerAgentHead);

module.exports = router;
