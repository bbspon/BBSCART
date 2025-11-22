const express = require("express");
const router = express.Router();

const upload = require("../middleware/franchiseIdentityUpload");

const {
  getFranchiseIdentity,
  updateFranchiseIdentity,
} = require("../controllers/franchiseIdentityController");

router.get("/:franchiseId", getFranchiseIdentity);

router.put(
  "/:franchiseId",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateFranchiseIdentity
);

module.exports = router;
