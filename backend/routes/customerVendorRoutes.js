// routes/customerBecomeVendorRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const customerController = require("../controllers/customerVendorController");

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
  res.json({ ok: true, msg: "customer-become-vendors root" })
);

// Simple upload (no OCR). Field: "document"
router.post(
  "/upload",
  upload.single("document"),
  customerController.uploadDocument
);

// Step save (partial upsert)
router.post("/step-by-key", customerController.saveStepByKey);
router.patch("/step-by-key", customerController.saveStepByKey);
// Admin endpoints (under the same router/mount)
router.get("/admin/customer-vendor/requests", customerController.listRequests);
router.get("/admin/customer-vendor/requests/:id", customerController.getRequestById);
router.post("/admin/customer-vendor/approve/:id", customerController.approve);
router.post("/admin/customer-vendor/reject/:id", customerController.reject);
router.get("/admin/customer-vendor/approved", customerController.listApproved);


// Optional legacy
router.patch("/:customerBecomeVendorId/step", customerController.saveStep);

// GST
router.put("/gst", upload.single("document"), customerController.updateGst);

// Bank
router.put(
  "/bank",
  upload.single("document"),
  customerController.updateBankDetails
);
router.put(
  "/:customerBecomeVendorId/bank",
  upload.single("document"),
  customerController.updateBankByParam
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
  customerController.updateOutlet
);

// Finalize
router.post("/register", customerController.registerCustomerBecomeVendor);

module.exports = router;
