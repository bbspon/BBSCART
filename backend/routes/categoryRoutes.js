// backend/routes/categoryRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const categoryController = require("../controllers/categoryController");
let subcategoryController = null;
try {
  subcategoryController = require("../controllers/subcategoryController");
} catch (_) {
  // optional; keep null if you don't have it yet
}

// -------- Safe middleware loaders (avoid [object Undefined]) --------
let authUser = null;
try {
  const auth = require("../middleware/authMiddleware");
  authUser = auth && typeof auth.authUser === "function" ? auth.authUser : null;
} catch (_) {}
const noop = (_req, _res, next) => next();
if (!authUser) authUser = noop;

let assignVendorMiddleware = null;
let requireAssignedVendor = null;
try {
  const assign = require("../middleware/assignVendorMiddleware");
  assignVendorMiddleware =
    assign && typeof assign.assignVendorMiddleware === "function"
      ? assign.assignVendorMiddleware
      : null;
  requireAssignedVendor =
    assign && typeof assign.requireAssignedVendor === "function"
      ? assign.requireAssignedVendor
      : null;
} catch (_) {}
if (!assignVendorMiddleware) assignVendorMiddleware = noop;
if (!requireAssignedVendor) requireAssignedVendor = noop;

// ---------------- Storefront (vendor-scoped) ----------------
// Define BEFORE "/:id" to avoid catching the string "vendor-categories" as :id
router.get(
  "/vendor-categories",
  assignVendorMiddleware,
  requireAssignedVendor,
  categoryController.getVendorCategories
);

// ---------------- Admin (unscoped) ----------------
// Use ROOT paths so mounting at "/api/categories" yields the right URLs
router.post("/", authUser, categoryController.createCategory);
router.get("/", authUser, categoryController.getAllCategories);
router.get(
  "/nearbyseller",
  authUser,
  categoryController.getNearbySellerCategories
);
router.get("/seller/:sellerId", categoryController.getCategoryBySellerId);
router.get("/:id", authUser, categoryController.getCategoryById);
router.put("/:id", authUser, categoryController.updateCategory);
router.delete("/:id", authUser, categoryController.deleteCategory);

// ---------------- Subcategory (optional; only if you mount here) ----------------
if (subcategoryController) {
  router.post(
    "/subcategories",
    authUser,
    subcategoryController.createSubcategory
  );
  router.get(
    "/subcategories",
    authUser,
    subcategoryController.getAllSubcategories
  );
  router.get(
    "/subcategories/:id",
    authUser,
    subcategoryController.getSubcategoryById
  );
  router.get(
    "/subcategories/seller/:sellerId",
    authUser,
    subcategoryController.getSubcategoryBySellerId
  );
  router.put(
    "/subcategories/:id",
    authUser,
    subcategoryController.updateSubcategory
  );
  router.delete(
    "/subcategories/:id",
    authUser,
    subcategoryController.deleteSubcategory
  );
}

module.exports = router;
