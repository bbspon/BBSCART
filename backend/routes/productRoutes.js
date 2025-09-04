// backend/routes/productRoutes.js
const express = require("express");
const router = express.Router();

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

// ---------- PUBLIC CATALOG (keep vendor-scoped; assignment logic intact) ----------
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

// Vendor-scoped list
router.get(
  "/public",
  assignVendorMiddleware,
  safe(productController.listProducts)
);
// Vendor-scoped facets
router.get(
  "/facets",
  assignVendorMiddleware,
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
router.post("/", authUser, uploadAny, safe(productController.createProduct));

router.get("/", authUser, safe(productController.getAllProducts));
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

// Keep last
router.get(
  "/:id",
  requireAssignedVendor,
  safe(productController.getProductById)
);
router.put("/:id", auth, uploadAny, safe(productController.updateProduct));
router.delete("/:id", auth, safe(productController.deleteProduct));

module.exports = router;
