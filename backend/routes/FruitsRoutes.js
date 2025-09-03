const express = require("express");
const router = express.Router();
const fruitController = require("../controllers/fruitController");
const { auth, authUser } = require("../middleware/authMiddleware");

// Public listing for storefront
router.get("/public", fruitController.listFruits);
router.get("/facets", fruitController.getFacets);

// Secure CRUD (adjust to your policy)
router.get("/:id", authUser, fruitController.getFruitById);
router.post("/", auth, fruitController.createFruit);
router.put("/:id", auth, fruitController.updateFruit);
router.delete("/:id", auth, fruitController.deleteFruit);

module.exports = router;
