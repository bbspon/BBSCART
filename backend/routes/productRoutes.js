// backend/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { uploadFields } = require("../middleware/upload");
const {
  deriveAssignedVendor,
  requireAdmin,
} = require("../middleware/vendorContext");
const { uploadImport } = require("../middleware/upload");
// Safe import helpers
const safe = (fn) =>
  typeof fn === "function"
    ? fn
    : (_req, res) => res.status(501).json({ message: "Handler missing" });
let productController = {};
try {
  productController = require("../controllers/productController");
} catch (_) {}

let uploadAny = (_req, _res, next) => next();
try {
  const up = require("../middleware/upload");
  if (typeof up.uploadAny === "function") uploadAny = up.uploadAny;
} catch (_) {}

let auth = (_req, _res, next) => next();
let authUser = (_req, _res, next) => next();
try {
  const a = require("../middleware/authMiddleware");
  if (typeof a.auth === "function") auth = a.auth;
  if (typeof a.authUser === "function") authUser = a.authUser;
} catch (_) {}

let assignVendorMiddleware = (_req, _res, next) => next();
try {
  const m = require("../middleware/assignVendorMiddleware");
  if (typeof m === "function") assignVendorMiddleware = m;
  if (typeof m.assignVendorMiddleware === "function")
    assignVendorMiddleware = m.assignVendorMiddleware;
} catch (_) {}

let requireAssignedVendor = (_req, _res, next) => next();
try {
  const r = require("../middleware/requireAssignedVendor");
  if (typeof r === "function") requireAssignedVendor = r;
} catch (_) {}

const mongoose = require("mongoose");
let Product, Vendor;
try {
  Product = require("../models/Product");
} catch (_) {}
try {
  Vendor = require("../models/Vendor");
} catch (_) {}
function noCachePublic(req, res, next) {
  res.set("Vary", "X-Pincode, Cookie");
  res.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.removeHeader("ETag");
  next();
}

// ---------- PUBLIC CATALOG (keep vendor-scoped; assignment logic intact) ----------
const storage = multer.memoryStorage();
const csvFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".csv" && file.mimetype !== "text/csv") {
    return cb(new Error("Invalid file type. Only .csv allowed"), false);
  }
  cb(null, true);
};
const uploadCsv = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/import-csv",
  authUser,
  uploadImport.single("file"),
  safe(productController.importProductsCSV)
);

router.get(
  "/export-csv",
  authUser,
  deriveAssignedVendor,
  safe(productController.exportProductsCSV)
);
// --- BEGIN: Absolute tmp + CSV+ZIP upload for /import-all ---
const tmpDir = path.join(process.cwd(), "backend", "tmp");
fs.mkdirSync(tmpDir, { recursive: true });

const disk = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tmpDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`);
  },
});
const csvExcelFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".csv" || ext === ".xlsx" || ext === ".xls" || file.mimetype === "text/csv" || 
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel") {
    return cb(null, true);
  }
  return cb(new Error("Invalid file type. Only .csv, .xlsx, or .xls allowed"), false);
};
const uploadCsvZip = multer({
  storage: disk,
  fileFilter: csvExcelFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// CSV (file) + optional images ZIP (images)
router.post(
  "/import-all",
  authUser,
  deriveAssignedVendor,
  uploadCsvZip.fields([{ name: "file", maxCount: 1 }, { name: "images", maxCount: 1 }]),
  safe(productController.importAllCSV)
);
// --- END: Absolute tmp + CSV+ZIP upload for /import-all ---

// Import products CSV and match to existing categories/subcategories by name
router.post(
  "/import-with-category-match",
  authUser,
  uploadCsvZip.single("file"),
  safe(productController.importProductsWithCategoryMatch)
);
router.get(
  "/download-row/:idOrSku",
  authUser,
  safe(productController.downloadProductRow)
);
router.get("/search", safe(productController.searchProducts));
router.get("/catalog/categories", safe(productController.listCategoriesPublic));
router.get(
  "/catalog/subcategories",
  safe(productController.listSubcategoriesPublic)
);
router.get("/catalog/groups", safe(productController.listGroupsBySubcategory));
router.get(
  "/catalog/category-by-slug",
  safe(productController.getCategoryBySlug)
);
// ---------- Admin helpers ----------
router.get(
  "/admin/vendors",
  auth,
  requireAdmin,
  safe(productController.listSellersForAdmin) // returns [{value,label}]
);
// Vendor-scoped list
router.get(
  "/public",
  assignVendorMiddleware,
    noCachePublic, // <-- add this

  safe(productController.listProducts)
);
// Vendor-scoped facets
router.get(
  "/facets",
  assignVendorMiddleware,
  noCachePublic, // <-- add this

  safe(productController.getFacets)
);

/**
 * Vendor-scoped product detail
 * 404 if product.seller_id doesn't belong to today's vendor
 */
router.get("/public/:id", assignVendorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    let { assignedVendorId, assignedVendorUserId } = req;
    if (!assignedVendorId && !assignedVendorUserId) {
      return res.status(400).json({ message: "Assigned vendor missing" });
    }
    let vDoc = null;
    if (!Vendor)
      return res.status(500).json({ message: "Vendor model missing" });
    if (!assignedVendorId && assignedVendorUserId) {
      vDoc = await Vendor.findOne({ user_id: assignedVendorUserId }).lean();
      if (vDoc) assignedVendorId = vDoc._id?.toString();
    }
    if (assignedVendorId && !assignedVendorUserId) {
      vDoc = await Vendor.findById(assignedVendorId).lean();
      if (vDoc) assignedVendorUserId = vDoc.user_id?.toString();
    }
    const allowed = new Set(
      [
        assignedVendorId,
        assignedVendorUserId,
        vDoc?._id?.toString(),
        vDoc?.user_id?.toString(),
      ].filter(Boolean)
    );
    if (!Product)
      return res.status(500).json({ message: "Product model missing" });
    const product = await Product.findById(id)
      .populate("category_id subcategory_id variants")
      .lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const sellerKey =
      product.seller_id?.toString?.() ||
      product.vendor_id?.toString?.() ||
      product.seller_user_id?.toString?.();

    if (!sellerKey || !allowed.has(sellerKey)) {
      return res
        .status(404)
        .json({ message: "Product not available from your vendor today" });
    }
    return res.status(200).json(product);
  } catch (err) {
    console.error("public product detail error:", err);
    return res.status(500).json({ message: "Failed to load product" });
  }
});

// ---------- ADMIN / INTERNAL (no pincode; admin token if you have it) ----------
router.post(
  "/import",
  authUser,
  uploadAny,
  safe(productController.importProducts)
);

// pass the middleware (do not call it again)
router.post(
  "/",
  auth,
  deriveAssignedVendor,
  uploadFields([
    { name: "product_img", maxCount: 1 },
    { name: "product_img2", maxCount: 1 },
    { name: "gallery_imgs", maxCount: 10 },
  ]),
  productController.createProduct
);
router.get(
  "/",
  authUser,
  deriveAssignedVendor,
  safe(productController.getAllProducts)
);
router.get(
  "/nearbyseller",
  authUser,
  safe(productController.getNearbySellerProducts)
);
router.get("/export", safe(productController.exportProducts));
router.get("/filter", safe(productController.getProductByFilter));
router.get("/tags", safe(productController.getAllProductTags));
router.get(
  "/catalog/product-names",
  safe(productController.listProductNamesBySubcategory)
);

router.get(
  "/category/:categoryId",
  safe(productController.getProductsByCategoryId)
);
router.get(
  "/subcategory/:subcategoryId",
  safe(productController.getProductsBySubCategoryId)
);
router.get("/seller/:sellerId", safe(productController.getProductsBySellerId));

// Debug assignment (for storefront vendor scoping)
router.get("/debug/assigned", assignVendorMiddleware, (req, res) => {
  res.json({
    pincode: req._resolvedPincode,
    dateKey: req._dateKey,
    assignedVendorId: req.assignedVendorId,
    assignedVendorUserId: req.assignedVendorUserId,
  });
});
// One-time sanity log: anything that prints "undefined" is the cause of your boot error.
console.log("[productRoutes] types", {
  auth: typeof auth,
  uploadAny: typeof uploadAny,
  deriveAssignedVendor: typeof deriveAssignedVendor,
  createProduct: typeof createProduct,
  updateProduct: typeof updateProduct,
  listSellersForAdmin: typeof productController.listSellersForAdmin,

  getAllProducts: typeof getAllProducts,
});
// Keep last
router.get(
  "/:id",
  requireAssignedVendor,
  safe(productController.getProductById)
);
router.put(
  "/:id",
  auth,
  uploadAny,
  deriveAssignedVendor,
  safe(productController.updateProduct)
);
router.delete("/:id", auth, safe(productController.deleteProduct));

// Utility endpoint: Bulk set is_global=true for products with subcategory_id
router.post("/bulk-set-is-global", authUser, safe(productController.bulkSetIsGlobal));

module.exports = router;
