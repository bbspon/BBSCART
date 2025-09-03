// // routes/vendorRoutes.js
// const express = require("express");
// const router = express.Router();
// const path = require("path");
// const multer = require("multer");

// // Controller
// const vendorController = require("../controllers/vendorController");

// // Try project upload middleware, else fallback to basic multer
// let uploadModule;
// try {
//   uploadModule = require("../middleware/upload");
// } catch (e) {
//   try {
//     uploadModule = require("../upload");
//   } catch (_e2) {
//     uploadModule = null;
//   }
// }
// let upload = uploadModule?.upload || uploadModule;
// if (!upload) {
//   const storage = multer.diskStorage({
//     destination: (_req, _file, cb) => cb(null, "uploads/"),
//     filename: (_req, file, cb) => {
//       const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, unique + path.extname(file.originalname));
//     },
//   });
//   upload = multer({ storage });
// }

// // Root probe
// router.get("/", (_req, res) => res.json({ ok: true, msg: "vendors root" }));

// // Simple upload (no OCR). Field name: "document"
// router.post(
//   "/upload",
//   upload.single("document"),
//   vendorController.uploadDocument
// );

// // Step save
// router.post("/step-by-key", vendorController.saveStepByKey);
// router.patch("/step-by-key", vendorController.saveStepByKey);

// // Optional legacy route
// router.patch("/:vendorId/step", vendorController.saveStep);

// // GST
// router.put("/gst", upload.single("document"), vendorController.updateGst);

// // Bank
// router.put(
//   "/bank",
//   upload.single("document"),
//   vendorController.updateBankDetails
// );
// router.put(
//   "/:vendorId/bank",
//   upload.single("document"),
//   vendorController.updateBankByParam
// );
// // routes/vendorRoutes.js (add new lines)
// router.post('/submit', vendorController.submitApplication);

// // Admin endpoints
// router.get('/admin/requests', vendorController.listPendingVendorRequests);
// router.get("/admin/vendors", vendorController.listVendors);

// router.get('/admin/:vendorId', vendorController.getVendorFull);
// router.post('/admin/:vendorId/decision', vendorController.decideVendor);
// router.get('/admin/notifications', vendorController.getNotifications);
// router.post('/admin/notifications/:id/read', vendorController.markNotificationRead);

// // Outlet image uses its own constraints (JPG/PNG; 5 MB)
// const outletStorage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, "uploads/"),
//   filename: (_req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });
// const uploadOutlet = multer({
//   storage: outletStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     const allowed = /jpeg|jpg|png/;
//     const ext = path.extname(file.originalname).toLowerCase();
//     const mime = file.mimetype.toLowerCase();
//     if (allowed.test(ext) && allowed.test(mime)) return cb(null, true);
//     return cb(new Error("Only JPG, JPEG, PNG allowed"));
//   },
// });

// router.put(
//   "/outlet",
//   uploadOutlet.single("outlet_nameboard_image"),
//   vendorController.updateOutlet
// );

// module.exports = router;
// routes/vendorRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

// Controller
const vendorController = require("../controllers/vendorController");

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
router.get("/", (_req, res) => res.json({ ok: true, msg: "vendors root" }));

// NEW: explicitly start a brand-new application (returns _id)
router.post("/start", vendorController.startApplication);

// Simple upload (no OCR). Field name: "document"
router.post("/upload", upload.single("document"), vendorController.uploadDocument);

// Step save
router.post("/step-by-key", vendorController.saveStepByKey);
router.patch("/step-by-key", vendorController.saveStepByKey);

// Optional legacy route
router.patch("/:vendorId/step", vendorController.saveStep);

// GST
router.put("/gst", upload.single("document"), vendorController.updateGst);

// Bank
router.put("/bank", upload.single("document"), vendorController.updateBankDetails);
router.put("/:vendorId/bank", upload.single("document"), vendorController.updateBankByParam);

// Final submit
router.post("/submit", vendorController.submitApplication);

// Admin endpoints
router.get("/admin/requests", vendorController.listPendingVendorRequests);
router.get("/admin/vendors", vendorController.listVendors);
router.get("/admin/:vendorId", vendorController.getVendorFull);
router.post("/admin/:vendorId/decision", vendorController.decideVendor);
router.get("/admin/notifications", vendorController.getNotifications);
router.post("/admin/notifications/:id/read", vendorController.markNotificationRead);

// Outlet image
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

router.put("/outlet", uploadOutlet.single("outlet_nameboard_image"), vendorController.updateOutlet);

module.exports = router;
