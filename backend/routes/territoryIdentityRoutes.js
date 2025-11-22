const express = require("express");
const router = express.Router();

const upload = require("../middleware/territoryIdentityUpload");
const {
  getTerritoryIdentity,
  updateTerritoryIdentity,
} = require("../controllers/territoryIdentityController");

// Get identity card
router.get("/:territoryId", getTerritoryIdentity);

// Update identity card (profile + all fields)
router.put(
  "/:territoryId",
  upload.fields([{ name: "profileImg", maxCount: 1 }]),
  updateTerritoryIdentity
);

module.exports = router;
