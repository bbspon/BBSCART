const express = require("express");
const router = express.Router();

const upload = require("../middleware/agentIdentityUpload");
const {
  getAgentIdentity,
  updateAgentIdentity,
} = require("../controllers/agentIdentityController");

router.get("/:agentId", getAgentIdentity);

router.put(
  "/:agentId",
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  updateAgentIdentity
);

module.exports = router;
