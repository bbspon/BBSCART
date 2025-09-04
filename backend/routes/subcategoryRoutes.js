// backend/routes/subcategoryRoutes.js
const express = require("express");
const router = express.Router();

let ctrl = require("../controllers/subcategoryController");

// If the controller file is missing or partial, guard every handler:
const safe = (fn) =>
  typeof fn === "function"
    ? fn
    : (_req, res) => res.status(500).json({ message: "Handler missing" });

router.get("/", safe(ctrl.getAllSubcategories));
router.post("/", safe(ctrl.createSubcategory));
router.get("/:id", safe(ctrl.getSubcategoryById));
router.put("/:id", safe(ctrl.updateSubcategory));
router.delete("/:id", safe(ctrl.deleteSubcategory));

// Optional: list by seller
router.get("/seller/:sellerId", safe(ctrl.getSubcategoryBySellerId));

module.exports = router;
