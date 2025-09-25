const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const XLSX = require("xlsx");
const fs = require("fs");
const createError = require("http-errors");
// Canonical CSV columns for subcategories
const SUBCATEGORY_COLUMNS = [
  'subcategoryId',    // your external id
  'mongoId',          // fallback to view _id
  'name',
  'description',
  'categoryId',       // Category.categoryId
  'categorySlug',     // Category.slug
  'categoryMongoId',  // Category._id
  'categoryName',     // Category.name (last-resort match)
  'sellerId'
];

// normalize values
const toStr = (v) => (v === undefined || v === null ? '' : String(v).trim());

async function resolveCategory(row) {
  const id = toStr(row.categoryId);
  const slug = toStr(row.categorySlug);
  const mongoId = toStr(row.categoryMongoId);
  const name = toStr(row.categoryName);

  if (id) {
    const c = await Category.findOne({ categoryId: id });
    if (c) return c;
  }
  if (slug) {
    const c = await Category.findOne({ slug });
    if (c) return c;
  }
  if (/^[0-9a-fA-F]{24}$/.test(mongoId)) {
    const c = await Category.findById(mongoId);
    if (c) return c;
  }
  if (name) {
    // ✅ case-insensitive match
    const c = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (c) return c;
  }
  return null;
}


function rowToSubDoc(row, category) {
  return {
    subcategoryId: toStr(row.subcategoryId) || undefined,
    name: toStr(row.name),
    description: toStr(row.description),
    category_id: category ? category._id : undefined, // ✅ ensure ObjectId
    seller_id: toStr(row.sellerId) || undefined,
  };
}

// CREATE: Add a new subcategory under a category
exports.createSubcategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body || {};
    const seller_id = req.user?.userId || null;

    if (!name || !category_id) {
      return res
        .status(400)
        .json({ message: "name and category_id are required" });
    }

    const category = await Category.findById(category_id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const sub = await Subcategory.create({
      name,
      description: description || "",
      category_id,
      seller_id,
    });
    await sub.populate("category_id");

    // add link to category if not present
    if (!category.subcategories?.includes(sub._id)) {
      category.subcategories = category.subcategories || [];
      category.subcategories.push(sub._id);
      await category.save();
    }

    return res.status(201).json(sub);
  } catch (err) {
    console.error("createSubcategory error", err);
    return res.status(500).json({ message: err.message });
  }
};

// READ: Get all subcategories
exports.getAllSubcategories = async (_req, res) => {
  try {
    const subs = await Subcategory.find().populate("category_id");
    return res.status(200).json(subs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// READ: Get a single subcategory by ID
// READ: Get by ID
exports.getSubcategoryById = async (req, res) => {
  try {
    const sub = await Subcategory.findById(req.params.id).populate("category_id");
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    return res.status(200).json(sub);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.getSubcategoriesByCategoryId = async (req, res) => {

    try {
      const cat = await Category.findById(req.params.id).populate(
        "subcategories"
      );
      if (!cat) return res.status(404).json({ message: "Category not found" });
      res.json(cat.subcategories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }   
// READ: Get a single subcategory by ID
exports.getSubcategoryBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const subs = await Subcategory.find({ seller_id: sellerId }).populate(
      "category_id"
    );
    return res.status(200).json(subs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE: Update a subcategory by ID
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body || {};
    const seller_id = req.user?.userId || null;

    const old = await Subcategory.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Subcategory not found" });

    const updated = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { name, description, category_id, seller_id },
      { new: true }
    ).populate("category_id");

    if (!updated)
      return res.status(404).json({ message: "Subcategory not found" });

    // if category changed, sync the relation arrays
    if (category_id && String(old.category_id) !== String(category_id)) {
      await Category.findByIdAndUpdate(old.category_id, {
        $pull: { subcategories: old._id },
      });
      await Category.findByIdAndUpdate(category_id, {
        $addToSet: { subcategories: updated._id },
      });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE: Delete a subcategory by ID
exports.deleteSubcategory = async (req, res) => {
  try {
    const sub = await Subcategory.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    await Category.findByIdAndUpdate(sub.category_id, {
      $pull: { subcategories: sub._id },
    });
    await Subcategory.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// IMPORT CSV/XLSX (upsert)
exports.importSubcategories = async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, "No file uploaded");
    const filePath = req.file.path;

    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    let created = 0,
      updated = 0,
      skipped = 0;
    const upserted = [],
      errors = [];

    for (const raw of rows) {
      // Map known headers (case-insensitive) + legacy aliases from your CSV
      const row = {};
      Object.keys(raw).forEach((k) => {
        const lk = String(k).toLowerCase();

        // standard headers (present in SUBCATEGORY_COLUMNS)
        const key = SUBCATEGORY_COLUMNS.find((c) => c.toLowerCase() === lk);
        if (key) row[key] = raw[k];

        // allow Mongo id to round-trip
        if (lk === "_id" || lk === "mongoid") row.mongoId = raw[k];

        // LEGACY ALIASES
        if (lk === "category_id") row.categoryMongoId = raw[k]; // parent category by _id
        if (lk === "seller_id") row.sellerId = raw[k];
        if (lk === "subcategory_id") row.subcategoryId = raw[k];

        // optional extra aliases if your CSV ever uses them
        if (lk === "catid" && !row.categoryId) row.categoryId = raw[k];
        if (lk === "category" && !row.categoryName) row.categoryName = raw[k];
        if (lk === "categoryname" && !row.categoryName)
          row.categoryName = raw[k]; // ✅ new alias
        if (lk === "category name" && !row.categoryName)
          row.categoryName = raw[k]; // ✅ Excel-style header
        if (lk === "categoryslug" && !row.categorySlug)
          row.categorySlug = raw[k];
      });

      // resolve category (will look at categoryId, categorySlug, categoryMongoId, categoryName)
      const category = await resolveCategory(row);
      if (!category) {
        skipped++;
        errors.push({
          row: raw,
          reason:
            "Category not found (check category_id / categorySlug / categoryId)",
        });
        continue;
      }

      const doc = rowToSubDoc(row, category);
      if (!doc.name || !doc.category_id) {
        skipped++;
        errors.push({ row: raw, reason: "Missing name or category" });
        continue;
      }

      // Match order: subcategoryId -> (name + category_id) -> mongoId
      const scId = toStr(row.subcategoryId);
      const csvMongoId = toStr(row.mongoId);
      let query = null;

      if (scId) query = { subcategoryId: scId };
      else if (doc.name && doc.category_id)
        query = { name: doc.name, category_id: doc.category_id };
      else if (/^[0-9a-fA-F]{24}$/.test(csvMongoId))
        query = { _id: csvMongoId };

      const existing = query ? await Subcategory.findOne(query) : null;

      if (existing) {
        if (!doc.subcategoryId && existing.subcategoryId)
          doc.subcategoryId = existing.subcategoryId;
        if (!doc.seller_id && req.user?.userId) doc.seller_id = req.user.userId;
        Object.assign(existing, doc);
        await existing.save();
        updated++;
        upserted.push(String(existing._id));
      } else {
        const payload = { ...doc };
        if (!payload.seller_id && req.user?.userId)
          payload.seller_id = req.user.userId;

        // allow create with provided _id (valid ObjectId only)
        if (/^[0-9a-fA-F]{24}$/.test(csvMongoId)) {
          const { Types } = require("mongoose");
          payload._id = new Types.ObjectId(csvMongoId);
        }
        const createdDoc = await Subcategory.create(payload);
        created++;
        upserted.push(String(createdDoc._id));
      }
    }

    fs.unlink(filePath, () => {});
    return res.json({
      ok: true,
      created,
      updated,
      skipped,
      count: created + updated,
      upserted,
      errors,
    });
  } catch (err) {
    return next(err);
  }
};


// EXPORT all subcategories as CSV
exports.exportSubcategories = async (_req, res, next) => {
  try {
    // Populate is optional; we null-check before reading category fields
    const subs = await Subcategory.find({}).populate("category_id").lean();

    const data = subs.map((s) => {
      const cat = s.category_id || null;
      return {
        subcategoryId: s.subcategoryId || (s._id ? String(s._id) : ""),
        mongoId: s._id ? String(s._id) : "",
        name: s.name || "",
        description: s.description || "",
        categoryId: cat?.categoryId || "",
        categorySlug: cat?.slug || "",
        categoryMongoId: cat?._id ? String(cat._id) : "",
        categoryName: cat?.name || "",
        sellerId: s.seller_id || "",
      };
    });

    // Build CSV
    const ws = XLSX.utils.json_to_sheet(data, { header: SUBCATEGORY_COLUMNS });
    const csv = XLSX.utils.sheet_to_csv(ws);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="subcategories.csv"'
    );
    return res.send(csv);
  } catch (err) {
    console.error("exportSubcategories error:", err);
    return res.status(500).json({ message: err.message || "Export failed" });
  }
};

// DOWNLOAD single subcategory row by Mongo _id
exports.downloadSubcategoryRow = async (req, res, next) => {
  try {
    const { idOrKey } = req.params;
    const s = /^[0-9a-fA-F]{24}$/.test(idOrKey)
      ? await Subcategory.findById(idOrKey).populate('category_id').lean()
      : await Subcategory.findOne({ subcategoryId: idOrKey }).populate('category_id').lean();

    if (!s) return next(createError(404, 'Subcategory not found'));

    const row = [{
      subcategoryId: s.subcategoryId || (s._id ? String(s._id) : ''),
      mongoId: s._id ? String(s._id) : '',
      name: s.name || '',
      description: s.description || '',
      categoryId: s.category_id?.categoryId || '',
      categorySlug: s.category_id?.slug || '',
      categoryMongoId: s.category_id?._id ? String(s.category_id._id) : '',
      categoryName: s.category_id?.name || '',
      sellerId: s.seller_id || ''
    }];

    const ws = XLSX.utils.json_to_sheet(row, { header: SUBCATEGORY_COLUMNS });
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="subcategory-${row[0].name || row[0].mongoId}.csv"`);
    return res.send(csv);
  } catch (err) {
    return next(err);
  }
};
