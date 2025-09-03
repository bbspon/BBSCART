const Grocery = require("../models/Grocery");

// GET /api/groceries/public
exports.listGroceries = async (req, res) => {
  const {
    search,
    minPrice,
    maxPrice,
    brands,
    forms,
    offers,
    rating_gte,
    freeDelivery,
    inStock,
    sort = "popularity",
    page = 1,
    limit = 12,
  } = req.query;

  const q = {};

  if (search && search.trim()) q.$text = { $search: search.trim() };

  if (brands)
    q.brand = {
      $in: brands
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

  if (forms)
    q.form = {
      $in: forms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

  if (offers)
    q.offers = {
      $in: offers
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

  if (rating_gte) q.rating_avg = { $gte: Number(rating_gte) };

  if (freeDelivery === "true") q.freeDelivery = true;

  if (inStock === "true") q.inStock = true;

  if (minPrice || maxPrice) {
    q["priceInfo.sale"] = {};
    if (minPrice) q["priceInfo.sale"].$gte = Number(minPrice);
    if (maxPrice) q["priceInfo.sale"].$lte = Number(maxPrice);
  }

  const sortMap = {
    popularity: { rating_avg: -1, rating_count: -1 },
    "price-asc": { "priceInfo.sale": 1 },
    "price-desc": { "priceInfo.sale": -1 },
    newest: { created_at: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [docs, total] = await Promise.all([
    Grocery.find(q)
      .sort(sortMap[sort] || {})
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Grocery.countDocuments(q),
  ]);

  const items = docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    brand: d.brand,
    form: d.form,
    weight: d.weight,
    image: d.image,
    rating: d.rating_avg || 0,
    reviews: d.rating_count || 0,
    assured: !!d.assured,
    price: d.priceInfo?.sale || 0,
    oldPrice: d.priceInfo?.mrp || 0,
    discountPct:
      d.priceInfo?.mrp && d.priceInfo?.mrp > 0
        ? Math.max(
            0,
            Math.round(
              ((d.priceInfo.mrp - d.priceInfo.sale) / d.priceInfo.mrp) * 100
            )
          )
        : 0,
    freeDelivery: !!d.freeDelivery,
    inStock: !!d.inStock,
    offers: d.offers || [],
    createdAt: d.created_at,
  }));

  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

// GET /api/groceries/facets
exports.getFacets = async (req, res) => {
  const agg = await Grocery.aggregate([
    {
      $facet: {
        brands: [
          { $group: { _id: "$brand", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        forms: [
          { $group: { _id: "$form", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        offers: [
          { $unwind: { path: "$offers", preserveNullAndEmptyArrays: false } },
          { $group: { _id: "$offers", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        price: [
          {
            $group: {
              _id: null,
              min: { $min: "$priceInfo.sale" },
              max: { $max: "$priceInfo.sale" },
            },
          },
        ],
      },
    },
  ]);

  const f = agg[0] || {};
  res.json({
    brands: (f.brands || [])
      .filter((b) => b._id)
      .map((b) => ({ name: b._id, count: b.count })),
    forms: (f.forms || [])
      .filter((r) => r._id)
      .map((r) => ({ name: r._id, count: r.count })),
    offers: (f.offers || [])
      .filter((o) => o._id)
      .map((o) => ({ name: o._id, count: o.count })),
    price: f.price?.[0]
      ? { min: f.price[0].min || 0, max: f.price[0].max || 0 }
      : { min: 0, max: 0 },
  });
};

// GET /api/groceries/:id
exports.getGroceryById = async (req, res) => {
  const d = await Grocery.findById(req.params.id);
  if (!d) return res.status(404).json({ error: "Not found" });
  res.json(d);
};

// POST /api/groceries
exports.createGrocery = async (req, res) => {
  const created = await Grocery.create(req.body);
  res.status(201).json(created);
};

// PUT /api/groceries/:id
exports.updateGrocery = async (req, res) => {
  const updated = await Grocery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};

// DELETE /api/groceries/:id
exports.deleteGrocery = async (req, res) => {
  const deleted = await Grocery.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
};
