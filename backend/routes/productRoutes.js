
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { uploadAny } = require("../middleware/upload");
const { auth, authUser } = require("../middleware/authMiddleware");

const assignVendorMiddleware = require("../middleware/assignVendorMiddleware");
const requireAssignedVendor = require("../middleware/requireAssignedVendor"); // keep if you already have it

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Vendor = require("../models/Vendor");

// ---------- PUBLIC CATALOG (put BEFORE any "/:id") ----------
router.get("/search", productController.searchProducts);

router.get("/catalog/categories", productController.listCategoriesPublic);
router.get("/catalog/subcategories", productController.listSubcategoriesPublic);
router.get("/catalog/groups", productController.listGroupsBySubcategory);
router.get("/catalog/category-by-slug", productController.getCategoryBySlug);

// Vendor-scoped list
router.get("/public", assignVendorMiddleware, productController.listProducts);

// Vendor-scoped facets
router.get("/facets", assignVendorMiddleware, productController.getFacets);

/**
 * Vendor-scoped product detail
 * - DO NOT populate seller_id (it stores Vendor _id in your JSON)
 * - Normalize assignment to both vendor _id and user_id
 * - 404 if product.seller_id doesn't belong to today's vendor
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

    // fetch vendor doc if needed so we always have both ids
    let vDoc = null;
    if (!assignedVendorId && assignedVendorUserId) {
      vDoc = await Vendor.findOne({ user_id: assignedVendorUserId }).lean();
      if (vDoc) assignedVendorId = vDoc._id?.toString();
    }
    if (assignedVendorId && !assignedVendorUserId) {
      vDoc = await Vendor.findById(assignedVendorId).lean();
      if (vDoc) assignedVendorUserId = vDoc.user_id?.toString();
    }

    const allowed = new Set(
      [assignedVendorId, assignedVendorUserId, vDoc?._id?.toString(), vDoc?.user_id?.toString()].filter(Boolean)
    );

    // NOTE: DO NOT populate seller_id
    const product = await Product.findById(id)
      .populate("category_id subcategory_id variants")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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

// ---------- ADMIN / INTERNAL ----------
router.post("/import", authUser, uploadAny, productController.importProducts);
router.post("/", authUser, uploadAny, productController.createProduct);

router.get("/", authUser, productController.getAllProducts);
router.get("/nearbyseller", authUser, productController.getNearbySellerProducts);
router.get("/export", productController.exportProducts);
router.get("/filter", productController.getProductByFilter);
router.get("/tags", productController.getAllProductTags);
router.get("/catalog/product-names", productController.listProductNamesBySubcategory);

router.get("/category/:categoryId", productController.getProductsByCategoryId);
router.get("/subcategory/:subcategoryId", productController.getProductsBySubCategoryId);
router.get("/seller/:sellerId", productController.getProductsBySellerId);
// add once in productRoutes.js for debugging:
router.get("/debug/assigned", assignVendorMiddleware, (req, res) => {
  res.json({
    pincode: req._resolvedPincode,
    dateKey: req._dateKey,
    assignedVendorId: req.assignedVendorId,
    assignedVendorUserId: req.assignedVendorUserId,
  });
});
// Keep last
router.get("/:id", requireAssignedVendor, productController.getProductById);
router.put("/:id", auth, uploadAny, productController.updateProduct);
router.delete("/:id", auth, productController.deleteProduct);


module.exports = router;
