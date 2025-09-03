const express = require("express");
const router = express.Router();
const groceryController = require("../controllers/groceryController");
const { auth, authUser } = require("../middleware/authMiddleware");

// Public storefront endpoints for Grocery.jsx
router.get("/public", groceryController.listGroceries);
router.get("/facets", groceryController.getFacets);

// Secure CRUD (adjust roles per your policy)
router.get("/:id", authUser, groceryController.getGroceryById);
router.post("/", auth, groceryController.createGrocery); // require logged-in privileged user
router.put("/:id", auth, groceryController.updateGrocery);
router.delete("/:id", auth, groceryController.deleteGrocery);

module.exports = router;
