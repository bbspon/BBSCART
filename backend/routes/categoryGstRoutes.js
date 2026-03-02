const express = require("express");
const router = express.Router();

const {
  listCategoryGst,
  updateCategoryGst,
  bulkUpdateCategoryGst,
  uploadMiddleware,
  bulkUploadFromExcel
} = require("../controllers/categoryGstController");

// router.use(authMiddleware) // if you already protect admin routes, apply same style here

router.get("/categories/gst", listCategoryGst);
router.put("/categories/:id/gst", updateCategoryGst);
router.put("/categories/gst/bulk", bulkUpdateCategoryGst);
router.post(
  "/categories/gst/upload",
  uploadMiddleware,
  bulkUploadFromExcel
);
module.exports = router;