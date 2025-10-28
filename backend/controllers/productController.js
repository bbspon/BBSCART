const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const User = require("../models/User");
const UserDetails = require("../models/UserDetails");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");
const csvParser = require("csv-parser");
const archiver = require("archiver");
const unzipper = require("unzipper");
const ProductGroup = require("../models/ProductGroup");
// prefer file path if present; otherwise keep a URL string from body
const { parse } = require("csv-parse/sync");
const Vendor = require("../models/Vendor");
const { emitProductUpsert } = require("../events/productEmitter");

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (v == null || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return undefined;
};
const toNumber = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const slugify = (str) =>
  String(str || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
const parseJSONSafe = (s) => {
  if (!s || typeof s !== "string") return undefined;
  try {
    const o = JSON.parse(s);
    return o && typeof o === "object" ? o : undefined;
  } catch {
    return "__JSON_ERROR__";
  }
};
const splitGallery = (s) => {
  if (!s) return [];
  const str = String(s).trim();
  if (!str) return [];
  const delim = str.includes("|") ? "|" : ",";
  return str
    .split(delim)
    .map((x) => x.trim())
    .filter(Boolean);
};
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const pickRow = (row, key, alt = []) => {
  if (row[key] != null && row[key] !== "") return row[key];
  for (const k of alt) if (row[k] != null && row[k] !== "") return row[k];
  return undefined;
};

function pickFilePath(files, field) {
  const f = files.find((x) => x.fieldname === field);
  return f ? `/uploads/${f.filename}` : "";
}
function pickUrl(body, ...keys) {
  for (const k of keys) {
    const v = (body[k] || "").toString().trim();
    if (v) return v;
  }
  return "";
}
function parseUrlList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  const s = String(v).trim();
  if (!s) return [];
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
  } catch {}
  // also accept pipe-separated string from CSV like "a|b|c"
  return s
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
}

const toArrayFiles = (files) => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  // multer.fields -> object of arrays
  return Object.values(files).flat();
};
function buildPublicMatch(req) {
  const ids = [];
  if (req.assignedVendorId) ids.push(String(req.assignedVendorId));
  if (req.assignedVendorUserId) ids.push(String(req.assignedVendorUserId)); // <— include user_id too

  const vendorOr = [];
  for (const id of ids) {
    vendorOr.push({ seller_id: id }); // string form
    if (mongoose.Types.ObjectId.isValid(id)) {
      vendorOr.push({ seller_id: new mongoose.Types.ObjectId(id) }); // ObjectId form
    }
  }

  return vendorOr.length
    ? { $or: [{ is_global: true }, { $or: vendorOr }] }
    : { is_global: true };
}
const toRegex = (s) =>
  new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

// ADD: bulk CSV helpers
const AdmZip = require("adm-zip"); // npm i adm-zip
const { parse: parseCsvSync } = require("csv-parse/sync"); // npm i csv-parse
// Case-insensitive column getter
// Case-insensitive column getter with BOM stripping
// Case/space/underscore/hyphen–insensitive column getter (also trims BOM)
function cleanKey(k) {
  return String(k || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, "");
}
function getVal(row, ...names) {
  if (!row) return "";
  const keys = Object.keys(row);
  for (const want of names) {
    const hit = keys.find((k) => cleanKey(k) === cleanKey(want));
    if (hit !== undefined) {
      const v = row[hit];
      return typeof v === "string"
        ? v.replace(/^\uFEFF/, "").trim()
        : (v ?? "");
    }
  }
  return "";
}

const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};
const toFloat = (v, d) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

// Build a basic filter from querystring (adjust field names if needed)
function buildGlobalFilter(q = {}) {
  const filter = {};

  // search across a few text-ish fields (adjust to your schema)
  if (q.search) {
    const rx = new RegExp(String(q.search).trim(), "i");
    filter.$or = [{ name: rx }, { title: rx }, { description: rx }];
  }

  // price range
  const minPrice = toFloat(q.minPrice, null);
  const maxPrice = toFloat(q.maxPrice, null);
  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  // brands (CSV)
  if (q.brands) {
    const arr = String(q.brands)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) filter.brand = { $in: arr };
  }

  // rating >= (if you store average rating)
  if (q.rating_gte) {
    const r = toFloat(q.rating_gte, null);
    if (r !== null) filter.rating = { $gte: r };
  }

  // RAM >= (adjust to your schema if needed)
  if (q.ram_gte) {
    const ram = toInt(q.ram_gte, null);
    if (ram !== null) filter.ram = { $gte: ram };
  }

  return filter;
}

function sortStage(sort) {
  switch (sort) {
    case "price-asc":
    case "price_asc":
      return { price: 1 };
    case "price-desc":
    case "price_desc":
      return { price: -1 };
    case "newest":
      return { createdAt: -1 };
    case "popularity":
    default:
      return { popularity: -1, createdAt: -1 }; // adjust if you have a popularity field
  }
}
const PRODUCT_COLUMNS = [
  "productId",
  "mongoId",
  "name",
  "description",
  "sku",
  "brand",
  "price",
  "stock",
  "isVariant",
  "isReview",
  "categoryId",
  "categorySlug",
  "categoryMongoId",
  "categoryName",
  "subcategoryId",
  "subcategorySlug",
  "subcategoryMongoId",
  "subcategoryName",
  "tags",
  "weight",
  "dimLength",
  "dimWidth",
  "dimHeight",
  "productImage",
  "productGallery",
  "seller_id",
];

/**
 * POST /api/products/import-all
 * Single CSV that can contain categories, subcategories, and products.
 * - Categories/Subcategories are created if missing.
 * - Products upsert by _id (if present) else by SKU.
 * - If seller_id blank -> is_global=true, else is_global=false and seller_id set.
 * - Accepts CSV columns: categoryName|category|category_name, subcategoryName|subcategory|subcategory_name,
 *   seller_id|sellerId|vendor_id, gallery_imgs or gallery_imgs[0..N], tags or tags[0..N]
 */
exports.importAllCSV = async (req, res) => {
  const defaultSellerId = (req.query.defaultSellerId || "").trim();
  const defaultSellerValid =
    defaultSellerId && mongoose.Types.ObjectId.isValid(defaultSellerId);

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ ok: false, error: "CSV file missing (field name: file)." });
    }

    const dryRun = String(req.query.dryRun || "").toLowerCase() === "true";
    const mode = String(req.query.mode || "upsert").toLowerCase(); // keep for future use

    // Parse CSV
    const csvText = req.file.buffer
      ? req.file.buffer.toString("utf8")
      : fs.readFileSync(req.file.path, "utf8");
    const rows = parse(csvText, { columns: true, skip_empty_lines: true });

    // Build helper sets to validate known IDs and lookups
    // Build helper sets to validate known IDs and lookups
    const [allCats, allSubs, allVendors] = await Promise.all([
      Category.find({}).lean(),
      Subcategory.find({}).lean(),
      Vendor.find(
        {},
        {
          _id: 1,
          email: 1,
          phone: 1,
          vendor_code: 1,
          vendor_fname: 1,
          vendor_lname: 1,
          name: 1,
        }
      ).lean(),
    ]);

    // Category/Subcategory fast lookups
    const catByKey = new Map();
    for (const c of allCats) {
      if (c._id) catByKey.set(String(c._id), c);
      if (c.slug) catByKey.set(`slug:${c.slug}`, c);
      if (c.name) catByKey.set(`name:${c.name.toLowerCase()}`, c);
    }
    const subByKey = new Map();
    for (const s of allSubs) {
      if (s._id) subByKey.set(String(s._id), s);
      if (s.slug) subByKey.set(`slug:${s.slug}`, s);
      if (s.name) subByKey.set(`name:${s.name.toLowerCase()}`, s);
    }

    // 🔑 Vendor lookup maps
    const vendorById = new Map();
    const vendorByEmail = new Map();
    const vendorByPhone = new Map();
    const vendorByCode = new Map();
    const vendorByName = new Map();

    for (const v of allVendors) {
      const id = String(v._id);
      vendorById.set(id, id);
      if (v.email) vendorByEmail.set(String(v.email).trim().toLowerCase(), id);
      if (v.phone) vendorByPhone.set(String(v.phone).replace(/\s+/g, ""), id);
      if (v.vendor_code) vendorByCode.set(String(v.vendor_code).trim(), id);

      if (v.name) vendorByName.set(String(v.name).trim().toLowerCase(), id);
      const composite = `${v.vendor_fname || ""} ${v.vendor_lname || ""}`
        .trim()
        .toLowerCase();
      if (composite) vendorByName.set(composite, id);
    }

    // Helpers
    const slugify = (str) =>
      String(str || "")
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "");

    const pick = (row, main, alts = []) => {
      if (row[main] != null && row[main] !== "") return row[main];
      for (const k of alts) if (row[k] != null && row[k] !== "") return row[k];
      return undefined;
    };

    const toBool = (v) => {
      if (typeof v === "boolean") return v;
      if (v == null || v === "") return undefined;
      const s = String(v).trim().toLowerCase();
      if (["true", "1", "yes", "y"].includes(s)) return true;
      if (["false", "0", "no", "n"].includes(s)) return false;
      return undefined;
    };

    const toNumber = (v) => {
      if (v == null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const getGallery = (row) => {
      // Accept pipe/comma separated 'gallery_imgs'
      const main = pick(row, "gallery_imgs", ["gallery", "images"]);
      let list = [];
      if (main) {
        const s = String(main);
        const delim = s.includes("|") ? "|" : ",";
        list = s
          .split(delim)
          .map((x) => x.trim())
          .filter(Boolean);
      }
      // Accept discrete columns like gallery_imgs[0], gallery_imgs[1], ...
      Object.keys(row)
        .filter((k) => /^gallery_imgs\[\d+\]$/i.test(k))
        .sort((a, b) => {
          const ai = Number(a.match(/\[(\d+)\]/)[1]);
          const bi = Number(b.match(/\[(\d+)\]/)[1]);
          return ai - bi;
        })
        .forEach((k) => {
          const v = String(row[k] || "").trim();
          if (v) list.push(v);
        });
      // De-duplicate
      return Array.from(new Set(list));
    };

    const getTags = (row) => {
      let tags = [];
      const tMain = pick(row, "tags", []);
      if (tMain) {
        try {
          // Allow JSON array or pipe/comma separated string
          const maybe = typeof tMain === "string" ? JSON.parse(tMain) : tMain;
          if (Array.isArray(maybe)) tags = maybe.map(String);
        } catch {
          const s = String(tMain);
          const delim = s.includes("|") ? "|" : ",";
          tags = s
            .split(delim)
            .map((x) => x.trim())
            .filter(Boolean);
        }
      }
      Object.keys(row)
        .filter((k) => /^tags\[\d+\]$/i.test(k))
        .sort((a, b) => {
          const ai = Number(a.match(/\[(\d+)\]/)[1]);
          const bi = Number(b.match(/\[(\d+)\]/)[1]);
          return ai - bi;
        })
        .forEach((k) => {
          const v = String(row[k] || "").trim();
          if (v) tags.push(v);
        });
      return Array.from(new Set(tags));
    };

    const ensureCategory = async (nameOrId) => {
      if (!nameOrId) return null;
      const s = String(nameOrId).trim();
      if (catByKey.has(s)) return catByKey.get(s);
      const byName = catByKey.get(`name:${s.toLowerCase()}`);
      if (byName) return byName;
      // create
      const doc = { name: s, slug: slugify(s), is_active: true };
      if (dryRun) return doc;
      const created = await Category.create(doc);
      // index for later rows
      catByKey.set(String(created._id), created);
      catByKey.set(`name:${created.name.toLowerCase()}`, created);
      catByKey.set(`slug:${created.slug}`, created);
      return created;
    };

    const ensureSubcategory = async (nameOrId, category_id) => {
      if (!nameOrId) return null;
      const s = String(nameOrId).trim();
      const byId = subByKey.get(s);
      if (byId) return byId;
      const byName = subByKey.get(`name:${s.toLowerCase()}`);
      if (byName) return byName;
      const doc = { name: s, slug: slugify(s), category_id, is_active: true };
      if (dryRun) return doc;
      const created = await Subcategory.create(doc);
      subByKey.set(String(created._id), created);
      subByKey.set(`name:${created.name.toLowerCase()}`, created);
      subByKey.set(`slug:${created.slug}`, created);
      return created;
    };

    const stats = {
      upserts: 0,
      createdCategories: 0,
      createdSubcategories: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // 1) Resolve category / subcategory from CSV
        const categoryName = pick(row, "categoryName", [
          "category",
          "category_name",
          "cat",
        ]);
        const subcategoryName = pick(row, "subcategoryName", [
          "subcategory",
          "subcategory_name",
          "subcat",
        ]);

        if (!categoryName)
          throw new Error("Missing category (column: categoryName/category)");
        const cat = await ensureCategory(categoryName);
        if (!cat || !cat._id) stats.createdCategories++; // dryRun case

        let sub = null;
        if (subcategoryName) {
          sub = await ensureSubcategory(subcategoryName, cat._id);
          if (!sub || !sub._id) stats.createdSubcategories++; // dryRun case
        }

        // 2) Resolve seller / global
        const sellerIdRaw = getVal(
          row,
          "seller_id",
          "sellerId",
          "Seller ID",
          "seller id",
          "vendor_id",
          "seller_user_id"
        );
        const sellerEmail = getVal(
          row,
          "seller_email",
          "sellerEmail",
          "Seller Email",
          "email"
        );
        const sellerPhone = getVal(
          row,
          "seller_phone",
          "sellerPhone",
          "Seller Phone",
          "mobile",
          "phone"
        );
        const sellerCode = getVal(
          row,
          "seller_code",
          "sellerCode",
          "Seller Code"
        );

        // helper to resolve seller by any of the supported fields
        async function resolveSellerId() {
          // 1) direct id
          if (sellerIdRaw) {
            const idStr = String(sellerIdRaw).trim();
            if (
              mongoose.Types.ObjectId.isValid(idStr) &&
              vendorById.has(idStr)
            ) {
              return vendorById.get(idStr);
            }
            if (vendorById.has(idStr)) return vendorById.get(idStr);
          }

          // 2) by email
          if (sellerEmail) {
            const key = String(sellerEmail).trim().toLowerCase();
            if (vendorByEmail.has(key)) return vendorByEmail.get(key);
          }

          // 3) by phone
          if (sellerPhone) {
            const key = String(sellerPhone).replace(/\s+/g, "");
            if (vendorByPhone.has(key)) return vendorByPhone.get(key);
          }

          // 4) by vendor_code
          if (sellerCode) {
            const key = String(sellerCode).trim();
            if (vendorByCode.has(key)) return vendorByCode.get(key);
          }

          // 5) by name (supports Vendor.name or vendor_fname + vendor_lname)
          const sellerName = getVal(
            row,
            "seller_name",
            "Seller Name",
            "sellerName",
            "vendorName"
          );
          if (sellerName) {
            const key = String(sellerName).trim().toLowerCase();
            if (vendorByName.has(key)) return vendorByName.get(key);

            // optional loose match for punctuation/spaces:
            const loose = key.replace(/[^a-z0-9]/g, "");
            for (const [k, id] of vendorByName.entries()) {
              if (k.replace(/[^a-z0-9]/g, "") === loose) return id;
            }
          }

          return ""; // not found → treated as global
        }

        const finalSellerId = await resolveSellerId();

        console.log(
          `[importAllCSV] row ${i + 1} → sellerIdRaw=${sellerIdRaw || "-"} email=${sellerEmail || "-"} phone=${sellerPhone || "-"} code=${sellerCode || "-"} name=${getVal(row, "seller_name", "Seller Name", "sellerName", "vendorName") || "-"} => final=${finalSellerId || "(global)"}`
        );
        let final = finalSellerId;
        if (!final && defaultSellerValid) final = defaultSellerId;
        const isGlobal = !final;

        // 3) Product identity
        const _id = pick(row, "_id", ["id"]);
        const SKU = pick(row, "SKU", ["sku"]);

        if (!_id && !SKU) {
          throw new Error("Missing identity: either _id or SKU is required");
        }

        // 4) Images and gallery
        const product_img =
          pick(row, "product_img", ["image", "image_url", "main_img"]) || "";
        const product_img2 =
          pick(row, "product_img2", ["image2", "image_url2", "sub_img"]) || "";
        const gallery_imgs = getGallery(row);
        const tags = getTags(row);

        // 5) Build update doc using your schema fields
        const name = pick(row, "name", ["product_name", "title"]) || "";
        const price = toNumber(pick(row, "price", ["sale_price", "mrp"]));
        const stock = toNumber(pick(row, "stock", ["qty", "quantity"]));
        const is_variant = toBool(
          pick(row, "is_variant", ["variant", "has_variants"])
        );
        const brand = pick(row, "brand", []);

        const base = {
          name,
          SKU,
          brand,
          product_img,
          product_img2,
          gallery_imgs,
          tags,
          price,
          stock,
          is_variant: Boolean(is_variant),
          seller_id: final || null,
          is_global: Boolean(isGlobal),
          category_id: cat._id || null,
          subcategory_id: sub ? sub._id : null,
        };

        if (dryRun) {
          stats.upserts++;
          continue;
        }

        // 6) Upsert
        const filter = _id
          ? { _id }
          : {
              SKU: base.SKU,
              category_id: base.category_id,
              subcategory_id: base.subcategory_id,
            };

        await Product.updateOne(
          filter,
          { $set: base, $setOnInsert: _id ? {} : {} },
          { upsert: true, setDefaultsOnInsert: true, strict: false }
        );

        stats.upserts++;
      } catch (rowErr) {
        stats.errors.push({ row: i + 1, error: rowErr.message });
      }
    }

    return res
      .status(stats.errors.length ? 207 : 200)
      .json({ ok: stats.errors.length === 0, ...stats });
  } catch (e) {
    console.error("importAllCSV fatal:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};

// resolve category/subcategory by multiple identifiers
async function resolveCategoryForRow(row) {
  const id = getVal(row, "categoryId");
  const slug = getVal(row, "categorySlug");
  const mid = getVal(row, "categoryMongoId", "category_id");
  const name = getVal(row, "categoryName");
  let c = null;
  if (id) c = await Category.findOne({ categoryId: id });
  if (!c && slug) c = await Category.findOne({ slug });
  if (!c && mid && mongoose.Types.ObjectId.isValid(mid))
    c = await Category.findById(mid);
  if (!c && name) c = await Category.findOne({ name });
  return c;
}
async function resolveSubcategoryForRow(row, categoryDoc) {
  const id = getVal(row, "subcategoryId");
  const slug = getVal(row, "subcategorySlug");
  const mid = getVal(row, "subcategoryMongoId", "subcategory_id");
  const name = getVal(row, "subcategoryName");
  let s = null;
  if (id) s = await Subcategory.findOne({ subcategoryId: id });
  if (!s && slug) s = await Subcategory.findOne({ slug });
  if (!s && mid && mongoose.Types.ObjectId.isValid(mid))
    s = await Subcategory.findById(mid);
  if (!s && name && categoryDoc)
    s = await Subcategory.findOne({ name, category_id: categoryDoc._id });
  return s;
}

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(1 - a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};
// --------- NEW: admin vendors list for the dropdown ----------
exports.listSellersForAdmin = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin" && role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const sellers = await User.find({ role: "seller", status: "active" })
      .select("_id name")
      .lean();

    const vendors = sellers.map((u) => ({
      value: String(u._id),
      label: u.name || String(u._id),
    }));
    return res.json({ success: true, vendors });
  } catch (e) {
    console.error("listSellersForAdmin error", e);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load sellers" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Debug multer input
    console.log("[CTRL FILE KEYS]", Object.keys(req.files || {}));
    console.log("[CTRL product_img]", req.files?.product_img?.[0]);
    console.log("[CTRL product_img2]", req.files?.product_img2?.[0]);
    console.log("[CTRL gallery count]", (req.files?.gallery_imgs || []).length);

    // normalize files
    const normalizeFiles = (filesObj) => {
      if (!filesObj) return [];
      if (Array.isArray(filesObj)) return filesObj;
      return Object.entries(filesObj).flatMap(([fieldname, arr]) =>
        (arr || []).map((f) => ({ ...f, fieldname }))
      );
    };
    const files = normalizeFiles(req.files);
    const pick = (name) => files.find((f) => f.fieldname === name);
    const pickAll = (name) => files.filter((f) => f.fieldname === name);

    const pickFilePath = (field) => {
      const f = pick(field);
      return f ? `/uploads/${f.filename}` : "";
    };
    const parseUrlList = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.map(String).filter(Boolean);
      try {
        const arr = JSON.parse(v);
        if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
      } catch {}
      return String(v)
        .split(/[|,;]+/)
        .map((x) => x.trim())
        .filter(Boolean);
    };

    // body
    const {
      name,
      description,
      price,
      stock,
      SKU,
      brand,
      weight,
      dimensions,
      tags,
      category_id,
      subcategory_id,
      is_variant,
      product_img_url,
      product_img2_url,
      gallery_img_urls,
      productGallery,
      seller_id, // 👈 important
    } = req.body;

    // parse objects
    let parsedDimensions = {};
    if (dimensions) {
      if (typeof dimensions === "string") {
        try {
          parsedDimensions = JSON.parse(dimensions);
        } catch {
          parsedDimensions = {};
        }
      } else if (typeof dimensions === "object") parsedDimensions = dimensions;
    }
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          parsedTags = tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(tags)) parsedTags = tags;
    }

    // images
    const productImage1 = pickFilePath("product_img") || product_img_url || "";
    const productImage2 =
      pickFilePath("product_img2") || product_img2_url || "";
    const galleryFiles = pickAll("gallery_imgs").map(
      (f) => `/uploads/${f.filename}`
    );
    const galleryUrls = parseUrlList(gallery_img_urls || productGallery);
    const galleryImages = [...galleryUrls, ...galleryFiles];

    // ✅ Seller logic
    const role = req.user?.role;
    const assignedVendorId = req.assignedVendorId;
    let finalSellerId = null;
    let isGlobal = false;

    if (role === "admin" || role === "super_admin") {
      finalSellerId = Array.isArray(seller_id)
        ? seller_id.find(Boolean)
        : seller_id;
      if (!finalSellerId) isGlobal = true;
    } else {
      if (!assignedVendorId) {
        return res.status(400).json({
          success: false,
          message: "Assigned vendor is missing for this request.",
        });
      }
      finalSellerId = assignedVendorId;
    }

    // ✅ Build product doc
    const doc = {
      name,
      description,
      SKU,
      brand,
      weight,
      dimensions: parsedDimensions,
      tags: parsedTags,
      category_id,
      subcategory_id,
      product_img: productImage1 || "",
      product_img2: productImage2 || "",
      gallery_imgs: galleryImages,
      price: price ? Number(price) : undefined,
      stock: stock ? Number(stock) : undefined,
      is_variant: String(is_variant) === "true",
      seller_id: finalSellerId || null,
      is_global: Boolean(isGlobal),
    };

    const product = await Product.create(doc);

    console.log("✅ Saved product:", {
      product_img: product.product_img,
      product_img2: product.product_img2,
      gallery_imgs: product.gallery_imgs,
      seller_id: product.seller_id,
      is_global: product.is_global,
    });

    require('../events/productEmitter').emitUpsert(product).catch(()=>{});
    try {
  await emitProductUpsert(savedProduct);
} catch (e) {
  console.error("[CRM] product-upsert failed:", e.message);
}

    return res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// productController.js

exports.getAllProducts = async (req, res) => {
  try {
    const role = req.user?.role;
    const q = {};
    if (role === "admin" || role === "super_admin") {
      const scope = String(req.query.scope || "all").toLowerCase();
      if (scope === "global") q.is_global = true;
      if (scope === "vendor") q.is_global = false;
    } else {
       if (req.assignedVendorId) {
      q.$or = [
         { seller_id: req.assignedVendorId },
         { is_global: true },
      ];
   } else {
      q.is_global = true;
         }
    }

    // 1) populate to make client-side handling easy
    const docs = await Product.find(q)
      .populate("seller_id", "_id")
      .sort({ created_at: -1 })
      .lean();

    // 2) normalize: make sure seller_id is a plain string (or null)
    const products = docs.map((p) => ({
      ...p,
      seller_id: p?.seller_id?._id
        ? String(p.seller_id._id) // populated
        : p?.seller_id
          ? String(p.seller_id) // raw ObjectId or string
          : null,
    }));

    return res.status(200).json({ products });
  } catch (e) {
    console.error("getAllProducts error", e);
    return res.status(200).json({ products: [] });
  }
};

exports.getAllProductTags = async (req, res) => {
  try {
    const products = await Product.find({}, "tags"); // Get only the tags field

    // Flatten and filter unique tags
    const uniqueTags = [
      ...new Set(products.flatMap((product) => product.tags)),
    ];

    res.status(200).json({ tags: uniqueTags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Get a single product by product_id (ADMIN/INTERNAL)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { pincode } = req.query;

    const product = await Product.findById(id).populate(
      "category_id subcategory_id variants seller_id"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Only check pincode if provided
    if (pincode) {
      const vendor = await Vendor.findById(product.seller_id);
      if (!vendor || vendor.pincode !== pincode) {
        return res
          .status(400)
          .json({ message: "Product not available in this pincode" });
      }
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Get a single product by seller_id
exports.getProductsBySellerId = async (req, res) => {
  console.log("getProductsBySellerId");
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ seller_id: sellerId }).populate(
      "category_id subcategory_id variants seller_id"
    );
    if (!products) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Get products by category_id
exports.getProductsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params; // Get category ID from request params

    const products = await Product.find({ category_id: categoryId }).populate(
      "category_id subcategory_id variants seller_id"
    );

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Get products by subcategory_id
exports.getProductsBySubCategoryId = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    const products = await Product.find({
      subcategory_id: subcategoryId,
    }).populate("category_id subcategory_id variants seller_id");

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this subcategory" });
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ: Filtered product list (ADMIN/INTERNAL; not used by public list)
exports.getProductByFilter = async (req, res) => {
  try {
    const { categories, subcategories, colors, tags, minPrice, maxPrice } =
      req.query;

    let filterConditions = {};

    if (categories) {
      const categoryArray = categories.split(",").map((id) => id.trim());
      filterConditions.category_id = { $in: categoryArray };
    }
    if (subcategories) {
      const subcategoryArray = subcategories.split(",").map((id) => id.trim());
      filterConditions.subcategory_id = { $in: subcategoryArray };
    }
    if (colors) {
      const colorArray = colors.split(",").map((color) => color.trim());
      filterConditions.color = { $in: colorArray };
    }
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filterConditions.tags = { $in: tagArray };
    }
    if (minPrice || maxPrice) {
      filterConditions.price = {};
      if (minPrice) filterConditions.price.$gte = parseFloat(minPrice);
      if (maxPrice) filterConditions.price.$lte = parseFloat(maxPrice);
    }

    console.log("Filter Conditions:", filterConditions);

    const products = await Product.find(filterConditions).populate(
      "category_id subcategory_id variants seller_id"
    );

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found matching the filters." });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getNearbySellerProducts = async (req, res) => {
  try {
    console.log("🟡 getNearbySellerProducts req.user:", req.user);

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

    const searchRadius = 5;

    const sellers = await User.find({ role: "seller" }).populate("userdetails");

    const nearbySellers = sellers.filter((seller) => {
      if (seller.userdetails?.latitude && seller.userdetails?.longitude) {
        const distance = haversineDistance(
          latitude,
          longitude,
          seller.userdetails.latitude,
          seller.userdetails.longitude
        );
        return distance <= searchRadius;
      }
      return false;
    });

    const sellerIds = nearbySellers.map((seller) => seller._id);

    const products = await Product.find({ seller_id: { $in: sellerIds } });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching nearby seller products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE: Update a product by product_id with image upload
exports.updateProduct = async (req, res) => {
  try {
    console.log("🔄 Received Update Request:", req.body);
    console.log("🔄 Received Update Files:", req.files);
    const productId = req.params.id;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    // Parse stringified fields
    let variants = req.body.variants;
    if (typeof variants === "string") {
      try {
        variants = JSON.parse(variants);
      } catch (err) {
        return res.status(400).json({ message: "❌ Invalid variants format" });
      }
    }

    const updatedProductData = { ...req.body };

    if (req.body.dimensions) {
      try {
        updatedProductData.dimensions = JSON.parse(req.body.dimensions);
      } catch (error) {
        return res
          .status(400)
          .json({ message: "❌ Invalid dimensions format" });
      }
    }

    if (req.body.tags) {
      try {
        updatedProductData.tags = Array.isArray(req.body.tags)
          ? req.body.tags
          : JSON.parse(req.body.tags);
      } catch (err) {
        return res.status(400).json({ message: "❌ Invalid tags format" });
      }
    }

    const productImgFile = req.files.find(
      (file) => file.fieldname === "product_img"
    );
    if (productImgFile) {
      if (existingProduct.product_img)
        removeOldImage(existingProduct.product_img);
      updatedProductData.product_img = `/uploads/${productImgFile.filename}`;
    } else {
      updatedProductData.product_img = existingProduct.product_img;
    }

    let retainedImages = [];

    if (req.body.existing_gallery_imgs) {
      try {
        const parsed = JSON.parse(req.body.existing_gallery_imgs);
        if (Array.isArray(parsed)) retainedImages = parsed;
      } catch (err) {
        return res
          .status(400)
          .json({ message: "❌ Invalid existing_gallery_imgs format" });
      }
    }

    const imagesToDelete = (existingProduct.gallery_imgs || []).filter(
      (img) => !retainedImages.includes(img)
    );
    imagesToDelete.forEach(removeOldImage);

    const newGalleryImages = req.files
      .filter((file) => file.fieldname === "new_gallery_imgs")
      .map((file) => `/uploads/${file.filename}`);

    updatedProductData.gallery_imgs = [...retainedImages, ...newGalleryImages];

    delete updatedProductData.variants;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedProductData,
      { new: true }
    );
    console.log("✅ Product Updated:", updatedProduct);

    require('../events/productEmitter').emitUpsert(updatedProduct).catch(()=>{});

    if (variants) {
      const existingVariants = await Variant.find({
        product_id: updatedProduct._id,
      });
      const existingVariantIds = existingVariants.map((v) => v._id.toString());

      const variantIds = [];
      const bulkOperations = [];

      for (const [index, variant] of variants.entries()) {
        const variantId = variant._id || new mongoose.Types.ObjectId();
        variant._id = variantId;
        variantIds.push(variantId);

        let variantImgPath =
          existingVariants.find(
            (v) => v._id.toString() === variantId.toString()
          )?.variant_img || "";
        const variantImgFile = req.files.find(
          (file) => file.fieldname === `variant_img_${index}`
        );
        if (variantImgFile) {
          if (variantImgPath) removeOldImage(variantImgPath);
          variantImgPath = `/uploads/${variantImgFile.filename}`;
        }

        let retainedGallery = [];

        try {
          if (variant.existing_variant_gallery_imgs) {
            const parsed =
              typeof variant.existing_variant_gallery_imgs === "string"
                ? JSON.parse(variant.existing_variant_gallery_imgs)
                : variant.existing_variant_gallery_imgs;

            if (Array.isArray(parsed)) retainedGallery = parsed;
          }
        } catch (err) {
          return res.status(400).json({
            message: `❌ Invalid existing_variant_gallery_imgs for variant ${index}`,
          });
        }

        const oldVariant = existingVariants.find(
          (v) => v._id.toString() === variantId.toString()
        );
        const oldGalleryImgs = oldVariant?.variant_gallery_imgs || [];

        const removed = oldGalleryImgs.filter(
          (img) => !retainedGallery.includes(img)
        );
        removed.forEach(removeOldImage);

        const newGalleryFiles = req.files.filter(
          (file) => file.fieldname === `variant_gallery_imgs_${index}`
        );
        const newGalleryPaths = newGalleryFiles.map(
          (file) => `/uploads/${file.filename}`
        );

        const finalGallery = [...retainedGallery, ...newGalleryPaths];

        const baseData = {
          product_id: updatedProduct._id,
          variant_name: variant.variant_name,
          price: variant.price,
          stock: variant.stock,
          SKU: variant.SKU,
          attributes: variant.attributes,
          variant_img: variantImgPath,
          variant_gallery_imgs: finalGallery,
        };

        if (existingVariantIds.includes(variantId.toString())) {
          bulkOperations.push({
            updateOne: {
              filter: { _id: variantId, product_id: updatedProduct._id },
              update: baseData,
            },
          });
        } else {
          bulkOperations.push({
            insertOne: {
              document: { _id: variantId, ...baseData },
            },
          });
        }
      }
      // inside updateProduct before saving
      if ("seller_id" in updates) delete updates.seller_id;
      if ("is_global" in updates) delete updates.is_global;

      const existing = await Product.findById(req.params.id);
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      if (role !== "admin" && role !== "super_admin") {
        if (existing.is_global)
          return res.status(403).json({
            success: false,
            message: "Vendors cannot edit global products",
          });
        if (
          String(existing.seller_id || "") !==
          String(req.assignedVendorId || "")
        ) {
          return res
            .status(403)
            .json({ success: false, message: "Not allowed" });
        }
      } else {
        const pickedSeller = req.body.seller_id || null;
        const makeGlobal =
          req.body.is_global === true || String(req.body.is_global) === "true";
        if (makeGlobal) {
          existing.seller_id = null;
          existing.is_global = true;
        } else if (pickedSeller) {
          existing.seller_id = pickedSeller;
          existing.is_global = false;
        }
      }

      Object.assign(existing, updates);

      if (bulkOperations.length > 0) {
        const bulkResult = await Variant.bulkWrite(bulkOperations);
        console.log("✅ Variant Bulk Write:", bulkResult);
      }

      await Variant.deleteMany({
        product_id: updatedProduct._id,
        _id: { $nin: variantIds },
      });

      updatedProduct.variants = variantIds;
      await updatedProduct.save();
      require('../events/productEmitter').emitUpsert(updatedProduct).catch(()=>{});
    }
    try {
  await emitProductUpsert(updatedProduct);
} catch (e) {
  console.error("[CRM] product-upsert failed:", e.message);
}
    res.status(200).json({
      message: "✅ Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({
      message: "❌ Internal Server Error",
      error: err.message,
    });
  }
};

// ✅ Utility function to remove old images from the server
function removeOldImage(imagePath) {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, "..", imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error("❌ Error deleting file:", fullPath, err);
      else console.log("🗑️ Deleted old image:", fullPath);
    });
  }
}

// DELETE: Delete a product by product_id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { product_img, gallery_imgs } = product;
    const uploadDir = path.join(__dirname, "../uploads");

    const deleteImage = (filePath) => {
      if (filePath) {
        const fullPath = path.join(uploadDir, path.basename(filePath));
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Error deleting file ${fullPath}:`, err);
            }
          });
        }
      }
    };

    deleteImage(product_img);
    if (Array.isArray(gallery_imgs) && gallery_imgs.length > 0) {
      gallery_imgs.forEach(deleteImage);
    }

    await Product.findOneAndDelete({ _id: req.params.id });
    res
      .status(200)
      .json({ message: "Product and associated images deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Export Products

exports.exportProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("variants")
      .populate("category_id")
      .populate("subcategory_id")
      .populate("seller_id")
      .lean();

    const csvFields = [
      "Product ID",
      "Product Name",
      "Description",
      "SKU",
      "Brand",
      "Weight",
      "Dimensions",
      "Tags",
      "Product Image",
      "Product Gallery Images",
      "Price",
      "Stock",
      "Is Review",
      "Is Variant",
      "Category ID",
      "Category Name",
      "Category Description",
      "Subcategory ID",
      "Subcategory Name",
      "Subcategory Description",
      "Variant ID",
      "Variant Name",
      "Variant Price",
      "Variant Stock",
      "Variant SKU",
      "Variant Image",
      "Variant Gallery Images",
      "Variant Attributes",
      "Seller ID",
      "Seller Name",
      "Seller Email",
      "Seller Phone",
      "Seller Address",
    ];

    const is24hex = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || "").trim());

    let csvData = [];
    let allImages = new Set(); // Collect unique image paths

    for (const product of products) {
      const category = product.category_id || {};
      const subcategory = product.subcategory_id || {};
      const sellerDoc =
        product.seller_id && typeof product.seller_id === "object"
          ? product.seller_id
          : null;

      // Robust seller id: prefer populated doc, else valid string id, else vendor fallbacks
      const sellerIdOut = (() => {
        if (sellerDoc && sellerDoc._id) return String(sellerDoc._id);
        if (is24hex(product.seller_id)) return String(product.seller_id);
        if (is24hex(product.vendor_id)) return String(product.vendor_id);
        if (is24hex(product.seller_user_id))
          return String(product.seller_user_id);
        return "";
      })();

      const pushImage = (imgPath) => {
        if (imgPath) allImages.add(imgPath);
      };

      const variants = Array.isArray(product.variants) ? product.variants : [];

      if (variants.length > 0) {
        for (const variant of variants) {
          // Collect images
          pushImage(product.product_img);
          product.gallery_imgs?.forEach(pushImage);
          pushImage(variant.variant_img);
          variant.variant_gallery_imgs?.forEach(pushImage);

          csvData.push({
            "Product ID": product._id,
            "Product Name": product.name,
            Description: product.description,
            SKU: product.SKU,
            Brand: product.brand,
            Weight: product.weight,
            Dimensions: product.dimensions
              ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}`
              : "",
            Tags: product.tags ? product.tags.join("|") : "",
            "Product Image": product.product_img,
            "Product Gallery Images": product.gallery_imgs
              ? product.gallery_imgs.join("|")
              : "",
            Price: product.price || "",
            Stock: product.stock || "",
            "Is Review": product.is_review,
            "Is Variant": true,
            "Category ID": category._id || "",
            "Category Name": category.name || "",
            "Category Description": category.description || "",
            "Subcategory ID": subcategory._id || "",
            "Subcategory Name": subcategory.name || "",
            "Subcategory Description": subcategory.description || "",
            "Variant ID": variant._id,
            "Variant Name": variant.variant_name,
            "Variant Price": variant.price,
            "Variant Stock": variant.stock,
            "Variant SKU": variant.SKU,
            "Variant Image": variant.variant_img,
            "Variant Gallery Images": variant.variant_gallery_imgs
              ? variant.variant_gallery_imgs.join("|")
              : "",
            "Variant Attributes": JSON.stringify(variant.attributes),
            "Seller ID": sellerIdOut,
            "Seller Name": sellerDoc ? sellerDoc.name || "" : "",
            "Seller Email": sellerDoc ? sellerDoc.email || "" : "",
            "Seller Phone": sellerDoc ? sellerDoc.phone || "" : "",
            "Seller Address": sellerDoc ? sellerDoc.address || "" : "",
          });
        }
      } else {
        pushImage(product.product_img);
        product.gallery_imgs?.forEach(pushImage);

        csvData.push({
          "Product ID": product._id,
          "Product Name": product.name,
          Description: product.description,
          SKU: product.SKU,
          Brand: product.brand,
          Weight: product.weight,
          Dimensions: product.dimensions
            ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}`
            : "",
          Tags: product.tags ? product.tags.join("|") : "",
          "Product Image": product.product_img,
          "Product Gallery Images": product.gallery_imgs
            ? product.gallery_imgs.join("|")
            : "",
          Price: product.price,
          Stock: product.stock,
          "Is Review": product.is_review,
          "Is Variant": false,
          "Category ID": category._id || "",
          "Category Name": category.name || "",
          "Category Description": category.description || "",
          "Subcategory ID": subcategory._id || "",
          "Subcategory Name": subcategory.name || "",
          "Subcategory Description": subcategory.description || "",
          "Variant ID": "",
          "Variant Name": "",
          "Variant Price": "",
          "Variant Stock": "",
          "Variant SKU": "",
          "Variant Image": "",
          "Variant Gallery Images": "",
          "Variant Attributes": "",
          "Seller ID": sellerIdOut,
          "Seller Name": sellerDoc ? sellerDoc.name || "" : "",
          "Seller Email": sellerDoc ? sellerDoc.email || "" : "",
          "Seller Phone": sellerDoc ? sellerDoc.phone || "" : "",
          "Seller Address": sellerDoc ? sellerDoc.address || "" : "",
        });
      }
    }

    const exportDir = path.join(__dirname, "../exports");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    const csvPath = path.join(exportDir, "products_with_sellers.csv");
    const zipPath = path.join(exportDir, "products_export.zip");

    const json2csvParser = new Parser({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);
    fs.writeFileSync(csvPath, csv);

    // Create ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = fs.createWriteStream(zipPath);

    output.on("close", () => {
      res.download(zipPath, "products_export.zip", (err) => {
        if (err) console.error("Download error:", err);
        // Clean up files
        fs.unlink(csvPath, () => {});
        fs.unlink(zipPath, () => {});
      });
    });

    archive.pipe(output);
    archive.file(csvPath, { name: "products_with_sellers.csv" });

    // Add image files
    allImages.forEach((imgPath) => {
      const localImgPath = path.join(__dirname, "../", imgPath);
      if (fs.existsSync(localImgPath)) {
        archive.file(localImgPath, { name: `${path.basename(imgPath)}` });
      }
    });

    archive.finalize();
  } catch (err) {
    console.error("Export Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Helper to delay (optional for better file handling)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Product Import (ZIP with inside CSV) — EXISTING
exports.importProducts = async (req, res) => {
  try {
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const zipFilePath = req.files[0].path;
    const extractFolder = path.join(
      __dirname,
      "../uploads",
      `extracted_${Date.now()}`
    );

    // 1. Create extraction folder
    fs.mkdirSync(extractFolder);

    // 2. Extract the zip file
    await fs
      .createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractFolder }))
      .promise();

    console.log(`✅ ZIP extracted to: ${extractFolder}`);

    // 3. Find the CSV file inside the extracted folder
    const files = fs.readdirSync(extractFolder);
    const csvFileName = files.find((file) => file.endsWith(".csv"));

    if (!csvFileName) {
      return res.status(400).json({ message: "CSV file not found in zip" });
    }

    const csvFilePath = path.join(extractFolder, csvFileName);
    const products = [];

    // 4. Parse CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => products.push(row))
      .on("end", async () => {
        try {
          for (const row of products) {
            try {
              const productId = row["Product ID"]?.trim();
              let finalProductId =
                productId && mongoose.Types.ObjectId.isValid(productId)
                  ? productId
                  : new mongoose.Types.ObjectId();

              const seller_id_from_csv = row["Seller ID"];
              let finalSellerId;
              if (
                seller_id_from_csv &&
                mongoose.Types.ObjectId.isValid(seller_id_from_csv)
              ) {
                finalSellerId = seller_id_from_csv;
              } else if (
                req.user &&
                mongoose.Types.ObjectId.isValid(req.user.userId)
              ) {
                finalSellerId = req.user.userId;
              } else {
                return res
                  .status(401)
                  .json({ message: "Unauthorized: Invalid Seller ID" });
              }

              // Handle Category
              let category = await Category.findOne({
                name: row["Category Name"],
              });
              if (!category) {
                category = new Category({
                  name: row["Category Name"],
                  seller_id: finalSellerId,
                  description: row["Category Description"],
                });
                await category.save();
              }

              // Handle Subcategory
              let subcategory = await Subcategory.findOne({
                name: row["Subcategory Name"],
                category_id: category._id,
              });
              if (!subcategory) {
                subcategory = new Subcategory({
                  name: row["Subcategory Name"],
                  category_id: category._id,
                  seller_id: finalSellerId,
                  description: row["Subcategory Description"],
                });
                await subcategory.save();
              }

              let dimensions = {};
              if (row["Dimensions"]) {
                const dimParts = row["Dimensions"].split("x");
                if (dimParts.length === 3) {
                  dimensions = {
                    length: parseFloat(dimParts[0]) || 0,
                    width: parseFloat(dimParts[1]) || 0,
                    height: parseFloat(dimParts[2]) || 0,
                  };
                }
              }

              // Find or create product
              let existingProduct = await Product.findOne({
                _id: finalProductId,
              });

              // Prepare image paths
              const productImageName = row["Product Image"]?.trim();
              const galleryImageNames = row["Gallery Images"]
                ? row["Gallery Images"].split("|").map((img) => img.trim())
                : [];

              const productImagePath = productImageName ? productImageName : "";
              const galleryImagesPaths = galleryImageNames.map((img) => img);

              if (existingProduct) {
                await Product.updateOne(
                  { _id: finalProductId },
                  {
                    name: row["Product Name"],
                    description: row["Description"],
                    SKU: row["SKU"],
                    brand: row["Brand"],
                    weight: row["Weight"],
                    dimensions: dimensions,
                    tags: row["Tags"] ? row["Tags"].split("|") : [],
                    product_img: productImagePath,
                    gallery_imgs: galleryImagesPaths,
                    price: parseFloat(row["Price"]) || 0,
                    stock: parseInt(row["Stock"]) || 0,
                    category_id: category._id,
                    subcategory_id: subcategory._id,
                    is_review: row["Is Review"] === "true",
                    is_variant: row["Is Variant"] === "true",
                    seller_id: finalSellerId,
                  }
                );
              } else {
                let newProduct = new Product({
                  _id: finalProductId,
                  name: row["Product Name"],
                  description: row["Description"],
                  SKU: row["SKU"],
                  brand: row["Brand"],
                  weight: row["Weight"],
                  dimensions: dimensions,
                  tags: row["Tags"] ? row["Tags"].split("|") : [],
                  product_img: productImagePath,
                  gallery_imgs: galleryImagesPaths,
                  price: parseFloat(row["Price"]) || 0,
                  stock: parseInt(row["Stock"]) || 0,
                  category_id: category._id,
                  subcategory_id: subcategory._id,
                  is_review: row["Is Review"] === "true",
                  is_variant: row["Is Variant"] === "true",
                  seller_id: finalSellerId,
                });
                await newProduct.save();
              }

              // Handle Variants
              if (row["Is Variant"] === "true") {
                let variant = await Variant.findOne({
                  product_id: finalProductId,
                  name: row["Variant Name"],
                });
                if (variant) {
                  await Variant.updateOne(
                    { product_id: finalProductId, name: row["Variant Name"] },
                    {
                      price: parseFloat(row["Variant Price"]) || 0,
                      stock: parseInt(row["Variant Stock"]) || 0,
                      attributes: row["Variant Attributes"]
                        ? JSON.parse(row["Variant Attributes"])
                        : {},
                    }
                  );
                } else {
                  let newVariant = new Variant({
                    product_id: finalProductId,
                    name: row["Variant Name"],
                    price: parseFloat(row["Variant Price"]) || 0,
                    stock: parseInt(row["Variant Stock"]) || 0,
                    attributes: row["Variant Attributes"]
                      ? JSON.parse(row["Variant Attributes"])
                      : {},
                  });
                  await newVariant.save();
                }
              }

              console.log(
                `✅ Product "${row["Product Name"]}" processed successfully.`
              );
            } catch (error) {
              console.error(
                `❌ Error processing product "${row["Product Name"]}":`,
                error
              );
            }
          }

          // 5. Move all extracted images into uploads folder
          const moveFiles = files.filter((file) => file !== csvFileName);
          for (const file of moveFiles) {
            const srcPath = path.join(extractFolder, file);
            const destPath = path.join(__dirname, "../uploads", file);
            if (fs.existsSync(srcPath)) {
              fs.renameSync(srcPath, destPath);
            }
          }

          // Cleanup extracted folder
          fs.rmSync(extractFolder, { recursive: true, force: true });

          return res
            .status(200)
            .json({ message: "Products imported successfully!" });
        } catch (error) {
          console.error("❌ Error after parsing CSV:", error);
          return res.status(500).json({ message: "Failed to import products" });
        }
      });
  } catch (error) {
    console.error("❌ Error importing products:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ====== NEW BULK CSV IMPORT HANDLERS (added without changing existing code) ======

function asBool(v) {
  if (v === true || v === false) return v;
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return undefined;
}
function asNum(v) {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function toOid(id) {
  if (!id) return null;
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : null;
}
function parseNetQty(raw, value, unit) {
  if (raw) return { raw };
  if (value && unit)
    return { raw: `${value} ${unit}`, value: asNum(value), unit };
  return undefined;
}
async function ensureCategory({ categoryId, categoryName, slug }) {
  let category = null;

  if (categoryId) {
    category = await Category.findOne({ categoryId });
  }
  if (!category && slug) {
    category = await Category.findOne({ slug });
  }
  if (!category && categoryName) {
    category = await Category.findOne({
      name: new RegExp(`^${categoryName}$`, "i"), // case-insensitive
    });
  }

  if (!category && categoryName) {
    // create new category if not found
    category = await Category.create({
      name: categoryName,
      slug: slug || undefined,
    });
  }

  return category;
}

async function ensureSubcategory({
  subcategoryId,
  subcategoryName,
  category_id,
  slug,
}) {
  let subcategory = null;

  if (subcategoryId) {
    subcategory = await Subcategory.findOne({ subcategoryId });
  }
  if (!subcategory && slug) {
    subcategory = await Subcategory.findOne({ slug, category_id });
  }
  if (!subcategory && subcategoryName) {
    subcategory = await Subcategory.findOne({
      name: new RegExp(`^${subcategoryName}$`, "i"),
      category_id,
    });
  }

  if (!subcategory && subcategoryName) {
    // create new subcategory if not found
    subcategory = await Subcategory.create({
      name: subcategoryName,
      category_id,
      slug: slug || undefined,
    });
  }

  return subcategory;
}

// Find file by fieldname from req.files (array or fields)
function findFile(req, field) {
  if (!req.files) return null;
  if (Array.isArray(req.files))
    return req.files.find((f) => f.fieldname === field) || null;
  // multer.fields style
  return req.files[field]?.[0] || null;
}

// 1) Import Categories from CSV
exports.importCategoriesCSV = async (req, res) => {
  try {
    const file = findFile(req, "csv");
    if (!file) return res.status(400).json({ message: "csv file required" });

    const rows = parseCsvSync(fs.readFileSync(file.path), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let upserts = 0;
    for (const r of rows) {
      const name = r.name?.trim();
      if (!name) continue;

      const idRaw = (r.id || r._id || "").trim();
      const oid = mongoose.Types.ObjectId.isValid(idRaw)
        ? new mongoose.Types.ObjectId(idRaw)
        : null;

      if (oid) {
        // Upsert by _id from CSV; set fields on insert/update
        await Category.updateOne(
          { _id: oid },
          {
            $setOnInsert: { _id: oid },
            $set: { name, slug: r.slug?.trim(), icon: r.icon?.trim() },
          },
          { upsert: true }
        );
      } else {
        // Fallback: upsert by name
        await Category.updateOne(
          { name },
          { $set: { name, slug: r.slug?.trim(), icon: r.icon?.trim() } },
          { upsert: true }
        );
      }
      upserts++;
    }
    return res.json({ ok: true, upserts });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message });
  }
};

// 2) Import Sub-categories from CSV
exports.importSubcategoriesCSV = async (req, res) => {
  try {
    const file = findFile(req, "csv");
    if (!file) return res.status(400).json({ message: "csv file required" });

    const rows = parseCsvSync(fs.readFileSync(file.path), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let upserts = 0;

    for (let idx = 0; idx < rows.length; idx++) {
      const r = rows[idx];

      // Accept many header spellings (case-insensitive)
      const categoryId = getVal(r, "categoryId", "CategoryId", "category_id");
      const categoryName = getVal(
        r,
        "categoryName",
        "CategoryName",
        "category"
      );
      const categorySlug = getVal(
        r,
        "categorySlug",
        "CategorySlug",
        "category_slug"
      );

      const name = getVal(
        r,
        "name",
        "Name",
        "subcategoryName",
        "subCategoryName"
      );
      if (!name) {
        console.warn(`Row ${idx + 1}: missing sub-category name, skipping`);
        continue;
      }

      const subIdRaw = getVal(r, "id", "_id");
      const subOid = mongoose.Types.ObjectId.isValid(subIdRaw)
        ? new mongoose.Types.ObjectId(subIdRaw)
        : null;

      // Resolve or create parent category by id/name/slug
      const cat = await ensureCategory({
        categoryId,
        categoryName,
        slug: categorySlug,
      });

      const slug = getVal(
        r,
        "slug",
        "Slug",
        "subcategorySlug",
        "subCategorySlug"
      );

      const filter = subOid ? { _id: subOid } : { name, category_id: cat._id };

      await Subcategory.updateOne(
        filter,
        {
          $setOnInsert: { ...(subOid ? { _id: subOid } : {}) },
          $set: { name, slug, category_id: cat._id },
        },
        { upsert: true }
      );

      upserts++;
    }

    return res.json({ ok: true, upserts });
  } catch (e) {
    console.error("importSubcategoriesCSV error:", e);
    return res.status(500).json({ message: e.message });
  }
};

// 3) Import Products from CSV (+ optional images ZIP)
exports.importProductsCSV = async (req, res) => {
  try {
    const csvFile = findFile(req, "csv");
    if (!csvFile) return res.status(400).json({ message: "csv file required" });

    const imagesZip = findFile(req, "images");
    const imagesMap = new Map();
    if (imagesZip) {
      const zip = new AdmZip(imagesZip.path);
      const outDir = path.join(process.cwd(), "uploads", "products");
      fs.mkdirSync(outDir, { recursive: true });
      zip.getEntries().forEach((e) => {
        if (e.isDirectory) return;
        const name = e.entryName.split("/").pop();
        const dest = path.join(outDir, name);
        fs.writeFileSync(dest, e.getData());
        imagesMap.set(name.toLowerCase(), `/uploads/products/${name}`);
      });
    }

    const rows = parseCsvSync(fs.readFileSync(csvFile.path), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`[importProductsCSV] rows=${rows.length}`);

    let upserts = 0;
    const errors = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const r = rows[idx];
      try {
        // Resolve category + subcategory (id/name/slug; case-insensitive)
        const categoryId = getVal(r, "categoryId", "CategoryId", "category_id");
        const categoryName = getVal(
          r,
          "categoryName",
          "CategoryName",
          "category"
        );
        const categorySlug = getVal(
          r,
          "categorySlug",
          "CategorySlug",
          "category_slug"
        );

        const subcategoryId = getVal(
          r,
          "subcategoryId",
          "SubcategoryId",
          "subCategoryId",
          "subcategory_id"
        );
        const subcategoryName = getVal(
          r,
          "subcategoryName",
          "SubcategoryName",
          "subCategoryName",
          "subcategory"
        );
        const subcategorySlug = getVal(
          r,
          "subcategorySlug",
          "SubcategorySlug",
          "subCategorySlug"
        );

        const cat = await ensureCategory({
          categoryId,
          categoryName,
          slug: categorySlug,
        });
        const sub = await ensureSubcategory({
          subcategoryId,
          subcategoryName,
          category_id: cat._id,
          slug: subcategorySlug,
        });

        // Images mapping
        let product_img = getVal(r, "product_img", "productImage", "image");
        const imageFile = getVal(r, "imageFile", "ImageFile", "mainImageFile");
        if (
          !product_img &&
          imageFile &&
          imagesMap.has(imageFile.toLowerCase())
        ) {
          product_img = imagesMap.get(imageFile.toLowerCase());
        }
        const gallery = [];
        const galleryRaw = getVal(
          r,
          "gallery_imgs",
          "gallery",
          "galleryImages"
        );
        const galleryFiles = galleryRaw
          .split(/[;,|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const gf of galleryFiles) {
          if (imagesMap.has(gf.toLowerCase()))
            gallery.push(imagesMap.get(gf.toLowerCase()));
          else if (/^https?:\/\//i.test(gf) || gf.startsWith("/uploads/"))
            gallery.push(gf);
        }

        const price = asNum(getVal(r, "price", "Price"));
        const mrp = asNum(getVal(r, "mrp", "MRP"));
        const sale = asNum(getVal(r, "sale", "SalePrice"));
        const _rawSku = getVal(r, "SKU", "sku", "eanNumber");
        const _normSku = _rawSku && String(_rawSku).trim();
        const doc = {
          name: getVal(r, "name", "Name", "productName"),
          SKU: getVal(
            r,
            "SKU",
            "sku",
            "eanNumber",
            _normSku ? { SKU: _normSku } : {}
          ),
          brand: getVal(r, "brand", "Brand"),
          description: getVal(r, "description", "Description"),
          price: price ?? undefined,
          priceInfo: {
            mrp: mrp ?? undefined,
            sale: sale ?? undefined,
            exchangeOffer: getVal(r, "exchangeOffer"),
            gstInvoice: asBool(getVal(r, "gstInvoice")),
            deliveryIn1Day: asBool(getVal(r, "deliveryIn1Day")),
            assured: asBool(getVal(r, "assured")),
            bestseller: asBool(getVal(r, "bestseller")),
          },
          stock: asNum(getVal(r, "stock", "Stock")),
          weight: asNum(getVal(r, "weight", "Weight")),
          dimensions: {
            length: asNum(getVal(r, "length", "Length")),
            width: asNum(getVal(r, "width", "Width")),
            height: asNum(getVal(r, "height", "Height")),
          },
          tags: getVal(r, "tags", "Tags")
            .split(/[;,|]/)
            .map((s) => s.trim())
            .filter(Boolean),
          product_img,
          gallery_imgs: gallery,
          category_id: cat._id,
          subcategory_id: sub._id,
          is_variant: asBool(getVal(r, "is_variant", "isVariant")),
          is_review: asBool(getVal(r, "is_review", "isReview")),
          seller_id: getVal(r, "seller_id", "sellerId") || undefined,
          rating_avg: asNum(getVal(r, "rating_avg")),
          rating_count: asNum(getVal(r, "rating_count")),
          groceries: {
            usedFor: getVal(r, "usedFor", "suitableFor"),
            processingType: getVal(r, "processingType", "type"),
            fssaiNumber: getVal(r, "fssaiNumber"),
            maxShelfLifeDays: asNum(
              getVal(r, "maxShelfLifeDays", "maxShelfLife")
            ),
            foodPreference: getVal(r, "foodPreference"),
            containerType: getVal(r, "containerType"),
            organic: asBool(getVal(r, "organic")),
            addedPreservatives: asBool(getVal(r, "addedPreservatives")),
            ingredients: getVal(r, "ingredients", "baseIngredient"),
            nutrientContent: getVal(r, "nutrientContent"),
            netQuantity: parseNetQty(
              getVal(r, "netQuantityRaw"),
              getVal(r, "netQuantityValue"),
              getVal(r, "netQuantityUnit")
            ),
            packOf: asNum(getVal(r, "packOf")),
            additives: getVal(r, "additives"),
            usageInstructions: getVal(r, "usageInstructions"),
          },
        };

        // Upsert key: prefer product id, else SKU, else (name+cat+sub)
        const prodIdRaw = getVal(r, "id", "_id");
        const prodOid = mongoose.Types.ObjectId.isValid(prodIdRaw)
          ? new mongoose.Types.ObjectId(prodIdRaw)
          : null;

        const filter = prodOid
          ? { _id: prodOid }
          : doc.SKU
            ? { SKU: doc.SKU }
            : { name: doc.name, category_id: cat._id, subcategory_id: sub._id };

        await Product.updateOne(
          filter,
          { $setOnInsert: prodOid ? { _id: prodOid } : {}, $set: doc },
          { upsert: true, strict: false, setDefaultsOnInsert: true } // NEW strict:false
        );

        upserts++;
      } catch (rowErr) {
        console.error(
          `[importProductsCSV] row ${idx + 1} error:`,
          rowErr.message
        );
        errors.push({ row: idx + 1, message: rowErr.message });
        // continue to next row
      }
    }

    const payload = { ok: errors.length === 0, upserts, errors };
    return res.status(errors.length ? 207 : 200).json(payload);
  } catch (e) {
    console.error("importProductsCSV fatal:", e);
    return res.status(500).json({ message: e.message });
  }
};
exports.listProducts = async (req, res) => {
  try {
    if (req.noVendorForPincode) {
      return res
        .status(404)
        .json({ success: true, products: [], total: 0, showContactForm: true });
    }

    const {
      search,
      minPrice,
      maxPrice,
      brands, // CSV
      rating_gte,
      ram_gte,
      sort = "newest",
      page = 1,
      limit = 20,
      subcategoryId,
      groupId,
    } = req.query;

    // Base match: always include globals; add vendor scope if assigned (dual-id/dual-type)
    const baseMatch = buildPublicMatch(req);
    const match = { ...baseMatch }; // NOTE: spread, not `{ .baseMatch }`

    // Optional filters (keep/extend as you already do)
    if (subcategoryId && mongoose.Types.ObjectId.isValid(subcategoryId)) {
      match.subcategory_id = new mongoose.Types.ObjectId(subcategoryId);
    }
    if (search && String(search).trim()) {
      const rx = new RegExp(String(search).trim(), "i");
      match.$or = (match.$or || []).concat([
        { name: rx },
        { title: rx },
        { description: rx },
      ]);
    }
    if (minPrice || maxPrice) {
      match.price = {};
      if (minPrice != null) match.price.$gte = Number(minPrice);
      if (maxPrice != null) match.price.$lte = Number(maxPrice);
    }
    if (brands) {
      const arr = String(brands)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) match.brand = { $in: arr };
    }
    if (rating_gte) match.rating = { $gte: Number(rating_gte) };
    if (ram_gte) match.ram = { $gte: Number(ram_gte) };

    const sortStage = (() => {
      const k = String(sort).toLowerCase();
      if (k === "price-asc" || k === "price_asc") return { price: 1 };
      if (k === "price-desc" || k === "price_desc") return { price: -1 };
      if (k === "popularity") return { popularity: -1, createdAt: -1 };
      return { createdAt: -1, _id: -1 };
    })();

    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const p = Math.max(1, parseInt(page, 10) || 1);
    const skip = (p - 1) * take;

    const [products, total] = await Promise.all([
      Product.find(match).sort(sortStage).skip(skip).limit(take).lean(),
      Product.countDocuments(match),
    ]);

    return res.json({
      success: true,
      products,
      total,
      page: p,
      limit: take,
      pages: Math.max(1, Math.ceil(total / take)),
    });
  } catch (err) {
    console.error("listProducts public error:", err);
    return res.status(500).json({ message: "Failed to list products" });
  }
};

// ---- PUBLIC getFacets (vendor-optional) ----
exports.getFacets = async (req, res) => {
  try {
    const match = req.noVendorForPincode
      ? { is_global: true }
      : buildPublicMatch(req);

    const agg = await Product.aggregate([
      { $match: match },
      {
        $facet: {
          brands: [
            { $match: { brand: { $ne: null } } },
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $project: { name: "$_id", count: 1, _id: 0 } },
            { $sort: { count: -1, name: 1 } },
          ],
          ram: [
            { $match: { ram: { $ne: null } } },
            { $group: { _id: "$ram", count: { $sum: 1 } } },
            { $project: { value: "$_id", count: 1, _id: 0 } },
            { $sort: { value: 1 } },
          ],
          price: [
            {
              $group: {
                _id: null,
                min: { $min: "$price" },
                max: { $max: "$price" },
              },
            },
          ],
        },
      },
    ]);

    const f = agg[0] || {};
    return res.json({
      brands: f.brands || [],
      ram: f.ram || [],
      price: f.price?.[0]
        ? { min: f.price[0].min, max: f.price[0].max }
        : { min: 0, max: 0 },
    });
  } catch (err) {
    console.error("getFacets public error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUBLIC detail: must belong to today's assigned seller
exports.getProduct = async (req, res) => {
  try {
    if (!req.assignedVendorId) {
      return res.status(400).json({ error: "Assigned seller missing" });
    }
    const p = await Product.findById(req.params.id).lean();
    if (!p || String(p.seller_id) !== String(req.assignedVendorId)) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(p);
  } catch (err) {
    console.error("getProduct error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json(p);
};

exports.deleteProduct = async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
};

// PUBLIC: list all categories (minimal fields for menu)
exports.listCategoriesPublic = async (_req, res) => {
  try {
    const items = await Category.find({}, "name icon slug")
      .sort({ name: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listSubcategoriesPublic = async (req, res) => {
  try {
    const { category_id } = req.query;
    const q = category_id ? { category_id } : {};
    const items = await Subcategory.find(q, "name category_id slug")
      .sort({ name: 1 })
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// PUBLIC: distinct product names by subcategory (for third column)
exports.listProductNamesBySubcategory = async (req, res) => {
  try {
    const { subcategory_id, limit = 15 } = req.query;
    if (!subcategory_id)
      return res.status(400).json({ message: "subcategory_id required" });

    // Top names by frequency under the subcategory
    const agg = await Product.aggregate([
      {
        $match: { subcategory_id: new mongoose.Types.ObjectId(subcategory_id) },
      },
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: Number(limit) },
      { $project: { _id: 0, name: "$_id" } },
    ]);

    return res.json({ items: agg });
  } catch (err) {
    console.error("listProductNamesBySubcategory error:", err);
    return res.status(500).json({ message: err.message });
  }
};
exports.listGroupsBySubcategory = async (req, res) => {
  try {
    const { subcategory_id, limit = 30 } = req.query;
    if (!subcategory_id)
      return res.status(400).json({ message: "subcategory_id required" });
    const items = await ProductGroup.find({ subcategory_id, active: true })
      .sort({ priority: 1, label: 1 })
      .limit(Number(limit))
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ message: "slug required" });
    const c = await Category.findOne({ slug: slug.toLowerCase() }).select(
      "_id name slug"
    );
    if (!c) return res.status(404).json({ message: "Category not found" });
    res.json({ item: c });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
exports.searchProducts = async (req, res) => {
  try {
    const {
      q: text = "",
      categoryId,
      subcategoryId,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 24,
      sort = "relevance", // "price_asc" | "price_desc" | "new" | "relevance"
    } = req.query || {};

    const query = {};
    const and = [];

    // Vendor filter from daily assignment (ONE CUSTOMER → ONE VENDOR)
    const orVendor = [];
    if (req.assignedVendorUserId) {
      const s = String(req.assignedVendorUserId);
      orVendor.push({ seller_id: s });
      try {
        orVendor.push({ seller_id: new mongoose.Types.ObjectId(s) });
      } catch {}
    }
    if (req.assignedVendorId) {
      try {
        orVendor.push({
          vendor_id: new mongoose.Types.ObjectId(String(req.assignedVendorId)),
        });
      } catch {}
    }
    if (orVendor.length) and.push({ $or: orVendor });

    // Category filters (optional)
    if (categoryId && mongoose.isValidObjectId(categoryId)) {
      and.push({ category_id: new mongoose.Types.ObjectId(categoryId) });
    }
    if (subcategoryId && mongoose.isValidObjectId(subcategoryId)) {
      and.push({ subcategory_id: new mongoose.Types.ObjectId(subcategoryId) });
    }

    // Brand (if you store it on the product)
    if (brand && String(brand).trim()) {
      and.push({ brand: String(brand).trim() });
    }

    // Price range (never 400; just ignore bad values)
    const min = Number(minPrice);
    const max = Number(maxPrice);
    const priceCond = {};
    if (Number.isFinite(min)) priceCond.$gte = min;
    if (Number.isFinite(max)) priceCond.$lte = max;
    if (Object.keys(priceCond).length) {
      // support either "price" or nested "priceInfo.sale"
      and.push({
        $or: [{ price: priceCond }, { "priceInfo.sale": priceCond }],
      });
    }

    // Text search
    if (text && String(text).trim()) {
      // Use $text if you have index; else fallback to regex on "name"/"title"
      and.push({
        $or: [
          { name: new RegExp(String(text).trim(), "i") },
          { title: new RegExp(String(text).trim(), "i") },
        ],
      });
    }

    if (and.length) query.$and = and;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortSpec = undefined;
    switch (sort) {
      case "price_asc":
        sortSpec = { "priceInfo.sale": 1, price: 1, _id: 1 };
        break;
      case "price_desc":
        sortSpec = { "priceInfo.sale": -1, price: -1, _id: -1 };
        break;
      case "new":
        sortSpec = { createdAt: -1, _id: -1 };
        break;
      default:
        // "relevance" or unknown → keep Mongo natural order or your preferred default
        sortSpec = { _id: -1 };
    }

    const [items, total] = await Promise.all([
      Product.find(query).sort(sortSpec).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      filteredByVendor: !!orVendor.length,
      products: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (e) {
    console.error("searchProducts error", e);
    // NEVER 400 here; return a safe, empty payload
    return res.status(200).json({
      success: false,
      filteredByVendor: !!(req.assignedVendorUserId || req.assignedVendorId),
      products: [],
      pagination: { page: 1, limit: 24, total: 0, pages: 1 },
      message: "Unable to load products",
    });
  }
};

exports.getAllProductsGlobal = async (req, res) => {
  try {
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, toInt(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const filter = buildGlobalFilter(req.query);
    const sort = sortStage(req.query.sort);

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, products: items, total, page, limit });
  } catch (err) {
    console.error("getAllProductsGlobal error:", err);
    res.status(500).json({ success: false, error: "Failed to load products" });
  }
};

// GET /api/products/facets/all
exports.getFacetsGlobal = async (req, res) => {
  try {
    const filter = buildGlobalFilter(req.query);

    const pipeline = [
      { $match: filter },
      {
        $facet: {
          brands: [
            { $match: { brand: { $ne: null } } },
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $project: { name: "$_id", count: 1, _id: 0 } },
            { $sort: { count: -1, name: 1 } },
          ],
          ram: [
            { $match: { ram: { $ne: null } } }, // adjust to your schema
            { $group: { _id: "$ram", count: { $sum: 1 } } },
            { $project: { value: "$_id", count: 1, _id: 0 } },
            { $sort: { value: 1 } },
          ],
          price: [
            {
              $group: {
                _id: null,
                min: { $min: "$price" },
                max: { $max: "$price" },
              },
            },
            { $project: { _id: 0, min: 1, max: 1 } },
          ],
        },
      },
    ];

    const [agg] = await Product.aggregate(pipeline);
    const price = (agg?.price && agg.price[0]) || { min: 0, max: 0 };

    res.json({
      success: true,
      brands: agg?.brands || [],
      ram: agg?.ram || [],
      price,
    });
  } catch (err) {
    console.error("getFacetsGlobal error:", err);
    res.status(500).json({ success: false, error: "Failed to load facets" });
  }
};
exports.exportProductsCSV = async (req, res) => {
  try {
    const list = await Product.find({})
      .populate("category_id subcategory_id seller_id")
      .lean();

    const is24hex = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || "").trim());

    const assignedFromCtx =
      (req.assignedVendorId && String(req.assignedVendorId)) ||
      (req.assignedVendorUserId && String(req.assignedVendorUserId)) ||
      "";

    const rows = list.map((p) => {
      const cat = p.category_id || {};
      const sub = p.subcategory_id || {};
      const sellerDoc =
        p.seller_id && typeof p.seller_id === "object" ? p.seller_id : null;

      // Same fallback chain as your UI, with one extra: assigned vendor from context
      const sellerIdOut =
        (sellerDoc && sellerDoc._id && String(sellerDoc._id)) ||
        (is24hex(p.seller_id) && String(p.seller_id)) ||
        (is24hex(p.vendor_id) && String(p.vendor_id)) ||
        (is24hex(p.seller_user_id) && String(p.seller_user_id)) ||
        assignedFromCtx || // << last fallback, matches admin list behavior
        "";

      const dims = p.dimensions || {};
      const tags = Array.isArray(p.tags)
        ? p.tags.join("|")
        : typeof p.tags === "string"
          ? p.tags
          : "";

      return {
        productId: p.productId || (p._id ? String(p._id) : ""),
        mongoId: String(p._id || ""),
        name: p.name || "",
        description: p.description || "",
        sku: p.SKU || p.sku || "",
        brand: p.brand || "",
        price: p.price ?? "",
        stock: p.stock ?? "",
        isVariant: !!p.is_variant,
        isReview: !!p.is_review,
        categoryId: cat.categoryId || "",
        categorySlug: cat.slug || "",
        categoryMongoId: cat._id ? String(cat._id) : "",
        categoryName: cat.name || "",
        subcategoryId: sub.subcategoryId || "",
        subcategorySlug: sub.slug || "",
        subcategoryMongoId: sub._id ? String(sub._id) : "",
        subcategoryName: sub.name || "",
        tags,
        weight: p.weight || "",
        dimLength: dims.length ?? "",
        dimWidth: dims.width ?? "",
        dimHeight: dims.height ?? "",
        productImage: p.product_img || "",
        productGallery: Array.isArray(p.gallery_imgs)
          ? p.gallery_imgs.join("|")
          : "",
        seller_id: sellerIdOut,
      };
    });

    const parser = new Parser({ fields: PRODUCT_COLUMNS });
    const csv = parser.parse(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="products.csv"');
    return res.status(200).send(csv);
  } catch (e) {
    console.error("exportProductsCSV error", e);
    return res.status(500).json({ message: e.message || "Export failed" });
  }
};

// ---------- DOWNLOAD ONE ROW (by _id or SKU) ----------
exports.downloadProductRow = async (req, res) => {
  try {
    const { idOrSku } = req.params;
    let p = null;
    if (mongoose.Types.ObjectId.isValid(idOrSku)) {
      p = await Product.findById(idOrSku)
        .populate("category_id subcategory_id seller_id")
        .lean();
    } else {
      p = await Product.findOne({ SKU: idOrSku })
        .populate("category_id subcategory_id seller_id")
        .lean();
    }
    if (!p) return res.status(404).json({ message: "Product not found" });

    const cat = p.category_id || {};
    const sub = p.subcategory_id || {};
    const seller = p.seller_id || {};
    const dims = p.dimensions || {};
    const tags = Array.isArray(p.tags)
      ? p.tags.join("|")
      : typeof p.tags === "string"
        ? p.tags
        : "";

    const row = [
      {
        productId: p.productId || "",
        mongoId: String(p._id || ""),
        name: p.name || "",
        description: p.description || "",
        sku: p.SKU || "",
        brand: p.brand || "",
        price: p.price ?? "",
        stock: p.stock ?? "",
        isVariant: !!p.is_variant,
        isReview: !!p.is_review,
        categoryId: cat.categoryId || "",
        categorySlug: cat.slug || "",
        categoryMongoId: cat._id ? String(cat._id) : "",
        categoryName: cat.name || "",
        subcategoryId: sub.subcategoryId || "",
        subcategorySlug: sub.slug || "",
        subcategoryMongoId: sub._id ? String(sub._id) : "",
        subcategoryName: sub.name || "",
        tags,
        weight: p.weight || "",
        dimLength: dims.length ?? "",
        dimWidth: dims.width ?? "",
        dimHeight: dims.height ?? "",
        productImage: p.product_img || "",
        productGallery: Array.isArray(p.gallery_imgs)
          ? p.gallery_imgs.join("|")
          : "",
        sellerId: seller._id ? String(seller._id) : p.seller_id || "",
      },
    ];

    const parser = new Parser({ fields: PRODUCT_COLUMNS });
    const csv = parser.parse(row);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="product-${p.SKU || p._id}.csv"`
    );
    return res.send(csv);
  } catch (e) {
    console.error("downloadProductRow error", e);
    return res.status(500).json({ message: e.message || "Download failed" });
  }
};

// ---------- CSV IMPORT (no images; idempotent upsert) ----------
exports.importProductsCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const csvText = fs.readFileSync(req.file.path, "utf8");
    const rows = parseCsvSync(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    let created = 0,
      updated = 0,
      skipped = 0;
    const upserted = [],
      errors = [];

    for (const raw of rows) {
      // tolerant getters (aliases + BOM-safe)
      const name = getVal(raw, "name", "productname");
      const description = getVal(raw, "description");
      const sku = getVal(raw, "sku", "SKU");
      const brand = getVal(raw, "brand");
      const price = asNum(getVal(raw, "price"));
      const stock = asNum(getVal(raw, "stock"));
      const isVariant = asBool(getVal(raw, "isVariant", "is_variant"));
      const isReview = asBool(getVal(raw, "isReview", "is_review"));
      const productId = getVal(raw, "productId");
      const mongoId = getVal(raw, "mongoId", "_id");
      const productImage = getVal(raw, "productImage");
      const productGallery = getVal(raw, "productGallery", "galleryImages");
      const weight = getVal(raw, "weight");
      const dimLength = asNum(getVal(raw, "dimLength"));
      const dimWidth = asNum(getVal(raw, "dimWidth"));
      const dimHeight = asNum(getVal(raw, "dimHeight"));
      const sellerIdRaw = getVal(raw, "sellerId");

      const tagsRaw = getVal(raw, "tags");
      let tags = [];
      if (tagsRaw) {
        try {
          tags = tagsRaw.includes("|")
            ? tagsRaw
                .split("|")
                .map((s) => s.trim())
                .filter(Boolean)
            : JSON.parse(tagsRaw);
        } catch {
          tags = [tagsRaw];
        }
      }

      // resolve category/subcategory
      const category = await resolveCategoryForRow(raw);
      if (!category) {
        skipped++;
        errors.push({ row: raw, reason: "Category not found" });
        continue;
      }
      const subcat = await resolveSubcategoryForRow(raw, category);
      if (!subcat) {
        skipped++;
        errors.push({ row: raw, reason: "Subcategory not found" });
        continue;
      }

      // seller
      const sellerId =
        (sellerIdRaw &&
          mongoose.Types.ObjectId.isValid(sellerIdRaw) &&
          sellerIdRaw) ||
        (req.user?.userId &&
          mongoose.Types.ObjectId.isValid(req.user.userId) &&
          req.user.userId) ||
        null;
      if (!sellerId) {
        skipped++;
        errors.push({ row: raw, reason: "Missing sellerId" });
        continue;
      }

      // build doc
      const doc = {
        name,
        description,
        SKU: sku,
        brand,
        price,
        stock,
        product_img: productImage || "",
        gallery_imgs: productGallery
          ? productGallery
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        dimensions: {
          length: dimLength ?? undefined,
          width: dimWidth ?? undefined,
          height: dimHeight ?? undefined,
        },
        tags,
        category_id: category._id,
        subcategory_id: subcat._id,
        is_variant: Boolean(isVariant),
        is_review: Boolean(isReview),
        seller_id: sellerId,
      };

      // match: productId -> SKU+seller -> _id
      let query = null;
      if (productId) query = { productId };
      if (!query && sku && sellerId) query = { SKU: sku, seller_id: sellerId };
      if (!query && mongoId && mongoose.Types.ObjectId.isValid(mongoId))
        query = { _id: mongoId };

      const existing = query ? await Product.findOne(query) : null;

      if (existing) {
        Object.assign(existing, doc);
        await existing.save();
        updated++;
        upserted.push(String(existing._id));
      } else {
        const payload = { ...doc };
        if (mongoId && mongoose.Types.ObjectId.isValid(mongoId))
          payload._id = new mongoose.Types.ObjectId(mongoId);
        const createdDoc = await Product.create(payload);
        created++;
        upserted.push(String(createdDoc._id));
      }
    }

    fs.unlink(req.file.path, () => {});
    return res.json({
      ok: true,
      created,
      updated,
      skipped,
      count: created + updated,
      upserted,
      errors,
    });
  } catch (e) {
    console.error("importProductsCSV error", e);
    return res.status(500).json({ message: e.message || "Import failed" });
  }
};
