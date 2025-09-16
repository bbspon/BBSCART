const express = require("express");
const router = express.Router();

let ctrl = require("../controllers/subcategoryController");
const { uploadImport } = require("../middleware/upload");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
router.post(
  "/import",
  // authMiddleware,
  // requireRole(["admin", "superadmin"]),
  uploadImport.single("file"),
  ctrl.importSubcategories
);

router.get(
  "/export",
  // authMiddleware,
  // requireRole(["admin", "superadmin"]),
  ctrl.exportSubcategories
);
router.get(
  "/download/:idOrKey",
  // authMiddleware,
  // requireRole(["admin", "superadmin"]),
  ctrl.downloadSubcategoryRow
);
router.get("/seller/:sellerId", ctrl.getSubcategoryBySellerId);

// existing routes (kept)
router.get("/", ctrl.getAllSubcategories);
router.post(
  "/",
  // authMiddleware,
  // requireRole(["admin", "superadmin"]),
  ctrl.createSubcategory
);
router.get("/:id", ctrl.getSubcategoryById);
router.put(
  "/:id",
  // authMiddleware,
  // requireRole(["admin", "superadmin"]),
  ctrl.updateSubcategory
);
router.delete(
  "/:id",
  // authMiddleware,
  // requireRole(["admin", "superadmin"]),
  ctrl.deleteSubcategory
);

// new CSV endpoints




module.exports = router;
