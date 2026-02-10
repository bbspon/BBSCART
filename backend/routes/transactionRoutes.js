// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();

const {
  getTransactions,
  getTransactionById,
} = require("../controllers/transactionController");

// GET /api/transactions
router.get("/", getTransactions);

// GET /api/transactions/:id
router.get("/:id", getTransactionById);

module.exports = router;
