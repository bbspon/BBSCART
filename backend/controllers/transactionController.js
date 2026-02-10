// controllers/transactionController.js
const Transaction = require("../models/Transaction");

function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

exports.getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      q,
      platform,
      sellerRole,
      paymentStatus,
      orderStatus,
      payoutStatus,
      paymentMethod,
      status,
      from, // YYYY-MM-DD
      to,   // YYYY-MM-DD
      sort = "date",
      dir = "desc",
    } = req.query;

    const filter = {};

    if (platform) filter.platform = platform;
    if (sellerRole) filter.sellerRole = sellerRole;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (orderStatus) filter.orderStatus = orderStatus;
    if (payoutStatus) filter.payoutStatus = payoutStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.status = status;

    // date range on "date" field (your JSON has "date")
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to) filter.date.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    // basic search
    if (q && String(q).trim()) {
      const s = String(q).trim();
      filter.$or = [
        { orderId: new RegExp(s, "i") },
        { transactionId: new RegExp(s, "i") },
        { buyerName: new RegExp(s, "i") },
        { buyerPhone: new RegExp(s, "i") },
        { sellerName: new RegExp(s, "i") },
      ];
    }

    const pageNum = Math.max(1, toInt(page, 1));
    const limitNum = Math.min(200, Math.max(1, toInt(limit, 50)));

    const sortField = ["date", "createdAt", "updatedAt", "finalAmount", "amount"].includes(sort)
      ? sort
      : "date";
    const sortDir = String(dir).toLowerCase() === "asc" ? 1 : -1;

    const [items, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      items,
    });
  } catch (err) {
    console.error("[transactions] getTransactions error:", err);
    return res.status(500).json({ message: "Failed to load transactions" });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Transaction.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Transaction not found" });
    return res.json(doc);
  } catch (err) {
    console.error("[transactions] getTransactionById error:", err);
    return res.status(500).json({ message: "Failed to load transaction" });
  }
};
