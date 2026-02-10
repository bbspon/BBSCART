const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Safe wrapper middleware
const safe = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// POST - Send contact message
router.post("/send-message", safe(contactController.sendContactMessage));

module.exports = router;
