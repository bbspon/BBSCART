// routes/deliveryWebhookRoutes.js
const express = require("express");
const router = express.Router();
const DeliveryWebhookController = require("../controllers/DeliveryWebhookController");

router.post("/status", DeliveryWebhookController.statusWebhook);

module.exports = router;
