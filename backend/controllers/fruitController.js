const Fruit = require("../models/Fruit");

// GET /api/fruits/public
exports.listFruits = async (req, res) => {
  const {
    search,
    minPrice,
    maxPrice,
    rating_gte,
    delivery1Day, // 'true' to filter
    sort = "popularity", // popularity | price-asc | price-desc | newest
    page = 1,
    limit = 20,
  } = req.query;

  const q = {};

  if (search && search.trim()) q.$text = { $search: search.trim() };

  if (rating_gte) q.rating_avg = { $gte: Number(rating_gte) };

  if (delivery1Day === "true") q.deliveryIn1Day = true;

  if (minPrice || maxPrice) {
    q["priceInfo.sale"] = {};
    if (minPrice) q["priceInfo.sale"].$gte = Number(minPrice);
    if (maxPrice) q["priceInfo.sale"].$lte = Number(maxPrice);
  }

  const sortMap = {
    popularity: { rating_avg: -1, rating_count: -1 },
    "price-asc": { "priceInfo.sale": 1 },
    "price-desc": { "priceInfo.sale": -1 },
    newest: { addedAt: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [docs, total] = await Promise.all([
    Fruit.find(q)
      .sort(sortMap[sort] || {})
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Fruit.countDocuments(q),
  ]);

  const items = docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    variety: d.variety,
    weight: d.weight,
    color: d.color,
    taste: d.taste,
    origin: d.origin,
    image: d.image,
    rating: d.rating_avg || 0,
    reviewsText:
      d.rating_count != null
        ? `${Number(d.rating_count).toLocaleString()} Ratings`
        : "",
    pricePerKg: d.priceInfo?.sale || 0,
    oldPricePerKg: d.priceInfo?.mrp || 0,
    discountText:
      d.priceInfo?.discountText ??
      (d.priceInfo?.mrp
        ? `${Math.max(
            0,
            Math.round(
              ((d.priceInfo.mrp - (d.priceInfo.sale || 0)) / d.priceInfo.mrp) *
                100
            )
          )}% off`
        : ""),
    seasonalOffer: d.seasonalOffer,
    organic: !!d.organic,
    deliveryIn1Day: !!d.deliveryIn1Day,
    freshnessDays: d.freshnessDays || undefined,
    addedAt: d.addedAt || d.created_at,
    bestseller: !!d.bestseller,
    specs: d.specs || [],
  }));

  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

// GET /api/fruits/facets  -> only price range needed by your UI
exports.getFacets = async (req, res) => {
  const agg = await Fruit.aggregate([
    {
      $group: {
        _id: null,
        min: { $min: "$priceInfo.sale" },
        max: { $max: "$priceInfo.sale" },
      },
    },
    { $limit: 1 },
  ]);
  const p = agg[0] || {};
  res.json({ price: { min: p.min || 0, max: p.max || 0 } });
};

// GET /api/fruits/:id
exports.getFruitById = async (req, res) => {
  const doc = await Fruit.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
};

// POST /api/fruits
exports.createFruit = async (req, res) => {
  const created = await Fruit.create(req.body);
  res.status(201).json(created);
};

// PUT /api/fruits/:id
exports.updateFruit = async (req, res) => {
  const updated = await Fruit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};

// DELETE /api/fruits/:id
exports.deleteFruit = async (req, res) => {
  const deleted = await Fruit.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
};
