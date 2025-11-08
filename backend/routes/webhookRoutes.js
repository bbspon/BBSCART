const router = require("express").Router();
const { returnsStatus } = require("../controllers/DeliveryWebhookController");
router.post("/delivery/returns/status", returnsStatus);
module.exports = router;
