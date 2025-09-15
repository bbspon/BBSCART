const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const User = require("../models/User");
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const createError = require("http-errors");

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Define the canonical export/import columns
const CATEGORY_COLUMNS = [
  'categoryId',      // stable external id or slug; if not present, use slug or name
  'name',
  'slug',
  'parentSlug',      // optional, for hierarchy
  'description',
  'isActive',
  'sortOrder',
  'imageUrl'
];

// Helper: ensure boolean/number coercion
const parseBool = v => (String(v).toLowerCase() === 'true' || v === true);
const parseNum = v => (v === '' || v === null || v === undefined ? undefined : Number(v));

const rowToDoc = (row) => ({
  categoryId: row.categoryId?.toString().trim() || undefined,
  name: row.name?.toString().trim(),
  slug: row.slug?.toString().trim(),
  parentSlug: row.parentSlug?.toString().trim() || undefined,
  description: row.description?.toString().trim() || '',
  isActive: row.isActive !== undefined ? parseBool(row.isActive) : true,
  sortOrder: row.sortOrder !== undefined ? parseNum(row.sortOrder) : undefined,
  imageUrl: row.imageUrl?.toString().trim() || ''
});
// CREATE: Add a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description = "" } = req.body || {};
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    const exists = await Category.findOne({ name });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "category already exists" });
    const doc = await Category.create({ name, description });
    res.status(201).json(doc);
  } catch (err) {
    console.error("createCategory error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// READ: Get all categories
exports.getAllCategories = async (_req, res) => {
  try {
    const categories = await Category.find().populate("subcategories");
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getNearbySellerCategories = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }
    const user_id = req.user.userId;
    const user = await User.findById(user_id).populate("userdetails");
    if (!user || !user.userdetails) {
      return res.status(404).json({ message: "User details not found" });
    }
    const { latitude, longitude } = user.userdetails;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "User location not available" });
    }

    const searchRadius = 5; // km
    const sellers = await User.find({ role: "seller" }).populate("userdetails");

    const nearbySellers = sellers.filter((seller) => {
      if (seller.userdetails?.latitude && seller.userdetails?.longitude) {
        const dist = haversineDistance(
          latitude,
          longitude,
          seller.userdetails.latitude,
          seller.userdetails.longitude
        );
        return dist <= searchRadius;
      }
      return false;
    });

    const sellerIds = nearbySellers.map((s) => s._id);
    const categories = await Category.find({
      seller_id: { $in: sellerIds },
    }).populate("subcategories");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching nearby seller categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// READ: Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "subcategories"
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// READ: Get a single category by ID
exports.getCategoryBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const category = await Category.find({ seller_id: sellerId }).populate(
      "subcategories"
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// UPDATE: Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;

    const doc = await Category.findByIdAndUpdate(id, update, { new: true });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json(doc);
  } catch (err) {
    console.error("updateCategory error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE: Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Category.findById(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });

    await Subcategory.deleteMany({ category_id: doc._id }).catch(() => {});
    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteCategory error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getVendorCategories = async (req, res) => {
  try {
    const vendor = req.assignedVendor;
    if (!vendor || !vendor._id) {
      return res
        .status(400)
        .json({ success: false, message: "No assigned vendor" });
    }
    if (!Product) {
      return res
        .status(500)
        .json({ success: false, message: "Product model missing" });
    }

    const pipeline = [
      {
        $match: { seller_id: new mongoose.Types.ObjectId(String(vendor._id)) },
      },
      { $project: { category: 1, subcategory: 1 } },
      {
        $group: { _id: { category: "$category", subcategory: "$subcategory" } },
      },
      {
        $group: {
          _id: "$_id.category",
          subs: { $addToSet: "$_id.subcategory" },
        },
      },
    ];

    const grouped = await Product.aggregate(pipeline);

    const categoriesOut = [];
    for (const row of grouped) {
      const catKey = row._id;
      let catName = String(catKey || "");
      let catDoc = null;

      if (mongoose.isValidObjectId(catKey)) {
        catDoc = await Category.findById(catKey).lean();
      } else {
        catDoc =
          (await Category.findOne({ slug: catKey }).lean()) ||
          (await Category.findOne({ name: catKey }).lean());
      }
      if (catDoc) catName = catDoc.name;

      const subNames = [];
      for (const sub of row.subs || []) {
        if (!sub) continue;
        let subName = String(sub);
        if (mongoose.isValidObjectId(sub)) {
          const sdoc = await Category.findById(sub).lean();
          if (sdoc) subName = sdoc.name;
        } else {
          const sdoc =
            (await Category.findOne({ slug: sub }).lean()) ||
            (await Category.findOne({ name: sub }).lean());
          if (sdoc) subName = sdoc.name;
        }
        subNames.push({ name: subName });
      }

      categoriesOut.push({
        key: String(catKey || catName),
        name: catName,
        subcategories: subNames.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }

    categoriesOut.sort((a, b) => a.name.localeCompare(b.name));
    return res.json({ categories: categoriesOut });
  } catch (err) {
    console.error("getVendorCategories error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.listCategories = async (_req, res) => {
  try {
    const rows = await Category.find({}).sort({ name: 1 }).lean();
    res.json(rows);
  } catch (err) {
    console.error("listCategories error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Import CSV/XLSX (add or update by slug or categoryId)
exports.importCategories = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, "No file uploaded");
    const filePath = req.file.path;

    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    let created = 0;
    let updated = 0;
    const upserted = [];

    for (const raw of rows) {
      // Normalize keys to match CATEGORY_COLUMNS (case-insensitive)
      const row = {};
      Object.keys(raw).forEach((k) => {
        const key = CATEGORY_COLUMNS.find(
          (c) => c.toLowerCase() === String(k).toLowerCase()
        );
        if (key) row[key] = raw[k];
        // also carry through potential _id/mongoId (not in CATEGORY_COLUMNS)
        if (String(k).toLowerCase() === "_id") row._id = raw[k];
        if (String(k).toLowerCase() === "mongoid") row.mongoId = raw[k];
      });

      const doc = rowToDoc(row);

      // Accept incoming categoryId explicitly if present in CSV
      if (!doc.categoryId && row.categoryId) {
        doc.categoryId = String(row.categoryId).trim();
      }

      // Derive slug if missing but name exists
      if (!doc.slug && !doc.categoryId && !doc.name) continue; // skip useless rows
      if (!doc.slug && doc.name) {
        doc.slug = doc.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      }

      // Optional CSV-provided Mongo _id (create-time only)
      const csvMongoId = row.mongoId || row._id;

      // Build match query: prefer categoryId, else slug, else mongoId
      let query = null;
      if (doc.categoryId) query = { categoryId: doc.categoryId };
      else if (doc.slug) query = { slug: doc.slug };
      else if (csvMongoId) query = { _id: csvMongoId };

      const existing = query ? await Category.findOne(query) : null;

      if (existing) {
        // Preserve existing.categoryId if incoming is empty
        if (!doc.categoryId && existing.categoryId)
          doc.categoryId = existing.categoryId;
        Object.assign(existing, doc);
        await existing.save();
        updated++;
        upserted.push(existing.slug);
      } else {
        // Create new. If CSV has a valid 24-hex _id, use it at create time only.
        const tryId = String(csvMongoId || "").trim();
        let createPayload = doc;
        if (/^[0-9a-fA-F]{24}$/.test(tryId)) {
          const { Types } = require("mongoose");
          createPayload = { _id: new Types.ObjectId(tryId), ...doc };
        }
        const createdDoc = await Category.create(createPayload);
        created++;
        upserted.push(createdDoc.slug);
      }
    }

    // Clean up temp file
    fs.unlink(filePath, () => {});

    return res.json({
      ok: true,
      created,
      updated,
      count: created + updated,
      upserted,
    });
  } catch (err) {
    return next(err);
  }
};


// Export all categories as CSV
exports.exportCategories = async (req, res, next) => {
  try {
    const cats = await Category.find({}).lean();

    const data = cats.map((c) => ({
      categoryId: c.categoryId || (c._id ? String(c._id) : ""),
      mongoId: c._id ? String(c._id) : "",
      name: c.name || "",
      slug: c.slug || "",
      parentSlug: c.parentSlug || "",
      description: c.description || "",
      isActive: c.isActive === undefined ? true : !!c.isActive,
      sortOrder: c.sortOrder ?? "",
      imageUrl: c.imageUrl || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data, { header: CATEGORY_COLUMNS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");

    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="categories.csv"'
    );
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

// Download a single category row by id or slug
exports.downloadCategoryRow = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const c = await Category.findOne({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    }).lean();
    if (!c) return next(createError(404, "Category not found"));

    const row = [
      {
        categoryId: c.categoryId || (c._id ? String(c._id) : ""),
        mongoId: c._id ? String(c._id) : "",
        name: c.name || "",
        slug: c.slug || "",
        parentSlug: c.parentSlug || "",
        description: c.description || "",
        isActive: c.isActive === undefined ? true : !!c.isActive,
        sortOrder: c.sortOrder ?? "",
        imageUrl: c.imageUrl || "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(row, { header: CATEGORY_COLUMNS });
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="category-${c.slug}.csv"`
    );
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};