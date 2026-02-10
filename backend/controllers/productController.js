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

    // Helper to clean column keys (handles BOM, newlines, case-insensitive)
    const cleanKey = (k) => {
      return String(k || "")
        .replace(/^\uFEFF/, "") // Remove BOM
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, "")
        .replace(/\n+/g, ""); // Remove newlines
    };

    // Case-insensitive column getter (more robust than pick)
    const getVal = (row, ...names) => {
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
    };

    const pick = (row, main, alts = []) => {
      // Try getVal first for better matching
      const val = getVal(row, main, ...alts);
      if (val !== "") return val;
      // Fallback to exact match
      if (row[main] != null && row[main] !== "") return row[main];
      for (const k of alts) if (row[k] != null && row[k] !== "") return row[k];
      return undefined;
    };

    // Parse category path (e.g., "HyperMarket > Beauty and Personal Care > Facial Care" -> "Beauty and Personal Care")
    const parseCategoryPath = (pathStr) => {
      if (!pathStr) return null;
      const str = String(pathStr).trim();
      if (!str) return null;
      
      // Split by comma first (in case multiple paths are provided)
      const paths = str.split(",").map(p => p.trim()).filter(Boolean);
      if (paths.length === 0) return null;
      
      // Take the first path and extract the category name
      const firstPath = paths[0];
      
      // If it contains ">", extract the second level (category)
      // Format: "HyperMarket > Beauty and Personal Care > Facial Care > Refreshing Face Wash"
      if (firstPath.includes(">")) {
        const parts = firstPath.split(">").map(p => p.trim()).filter(Boolean);
        // Return the second part (category) if available, otherwise first part
        return parts.length >= 2 ? parts[1] : parts[0];
      }
      
      // If no ">", return as-is
      return firstPath;
    };

    // Parse subcategory from comma-separated or path format
    const parseSubcategory = (subcatStr) => {
      if (!subcatStr) return null;
      const str = String(subcatStr).trim();
      if (!str) return null;
      
      // Split by comma first
      const parts = str.split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return null;
      
      // Take the last part (usually the most specific subcategory)
      const lastPart = parts[parts.length - 1];
      
      // If it contains ">", extract the last part
      if (lastPart.includes(">")) {
        const pathParts = lastPart.split(">").map(p => p.trim()).filter(Boolean);
        return pathParts[pathParts.length - 1];
      }
      
      return lastPart;
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
      const main = getVal(row, "gallery_imgs", "gallery", "images", "productGallery") || 
                   pick(row, "gallery_imgs", ["gallery", "images"]);
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
      const tMain = getVal(row, "tags", "Tags") || pick(row, "tags", []);
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
      if (!nameOrId) return { category: null, wasNew: false };
      const s = String(nameOrId).trim();
      if (!s) return { category: null, wasNew: false };
      
      // Check if it's an ObjectId
      if (mongoose.Types.ObjectId.isValid(s)) {
        const found = catByKey.get(s);
        if (found) return { category: found, wasNew: false };
      }
      
      // Check by name (case-insensitive)
      const byName = catByKey.get(`name:${s.toLowerCase()}`);
      if (byName) return { category: byName, wasNew: false };
      
      // Check by slug if exists
      const slug = slugify(s);
      const bySlug = catByKey.get(`slug:${slug}`);
      if (bySlug) return { category: bySlug, wasNew: false };
      
      // create new category
      const doc = { name: s };
      if (dryRun) {
        // Return a mock object for dry run
        return { category: { _id: null, name: s }, wasNew: true };
      }
      const created = await Category.create(doc);
      // index for later rows
      catByKey.set(String(created._id), created);
      catByKey.set(`name:${created.name.toLowerCase()}`, created);
      if (created.slug) catByKey.set(`slug:${created.slug}`, created);
      return { category: created, wasNew: true };
    };

    const ensureSubcategory = async (nameOrId, category_id) => {
      if (!nameOrId) return { subcategory: null, wasNew: false };
      const s = String(nameOrId).trim();
      if (!s) return { subcategory: null, wasNew: false };
      
      // Check if it's an ObjectId
      if (mongoose.Types.ObjectId.isValid(s)) {
        const found = subByKey.get(s);
        if (found) return { subcategory: found, wasNew: false };
      }
      
      // Check by name (case-insensitive)
      const byName = subByKey.get(`name:${s.toLowerCase()}`);
      if (byName) return { subcategory: byName, wasNew: false };
      
      // Check by slug if exists
      const slug = slugify(s);
      const bySlug = subByKey.get(`slug:${slug}`);
      if (bySlug) return { subcategory: bySlug, wasNew: false };
      
      // create new subcategory
      const doc = { name: s, category_id };
      if (dryRun) {
        // Return a mock object for dry run
        return { subcategory: { _id: null, name: s, category_id }, wasNew: true };
      }
      const created = await Subcategory.create(doc);
      subByKey.set(String(created._id), created);
      subByKey.set(`name:${created.name.toLowerCase()}`, created);
      if (created.slug) subByKey.set(`slug:${created.slug}`, created);
      return { subcategory: created, wasNew: true };
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
        // Use getVal for better column matching (handles case-insensitive, BOM, newlines)
        const categoryNameRaw = getVal(
          row,
          "categoryName",
          "category",
          "category_name",
          "cat",
          "Category",
          "Categories"
        );
        const subcategoryNameRaw = getVal(
          row,
          "subcategoryName",
          "subcategory",
          "subcategory_name",
          "subcat",
          "Subcategory",
          "Subcategories"
        );

        // Debug logging for first few rows
        if (i < 3) {
          console.log(`[Row ${i + 1}] categoryNameRaw:`, JSON.stringify(categoryNameRaw));
          console.log(`[Row ${i + 1}] subcategoryNameRaw:`, JSON.stringify(subcategoryNameRaw));
        }

        // Parse category path to extract actual category name
        let categoryName = parseCategoryPath(categoryNameRaw);
        if (!categoryName) {
          // If parsing failed, try using the raw value as fallback
          categoryName = categoryNameRaw || pick(row, "categoryName", ["category", "category_name", "cat", "Categories"]);
        }
        
        if (!categoryName) {
          throw new Error(`Row ${i + 1}: Missing category (column: categoryName/category). Available columns: ${Object.keys(row).join(", ")}`);
        }

        // Debug logging
        if (i < 3) {
          console.log(`[Row ${i + 1}] Parsed categoryName:`, JSON.stringify(categoryName));
        }

        const { category: cat, wasNew: wasNewCategory } = await ensureCategory(categoryName);
        if (!cat) {
          throw new Error(`Row ${i + 1}: Failed to create/find category: ${categoryName}`);
        }
        
        // Track category creation
        if (wasNewCategory) {
          stats.createdCategories++;
        }

        // Ensure we have a valid category_id (required field)
        if (!cat._id && !dryRun) {
          throw new Error(`Row ${i + 1}: Category creation failed for: ${categoryName}`);
        }

        let sub = null;
        if (subcategoryNameRaw && cat._id) {
          const parsedSubcat = parseSubcategory(subcategoryNameRaw);
          if (parsedSubcat) {
            // Debug logging
            if (i < 3) {
              console.log(`[Row ${i + 1}] Parsed subcategory:`, JSON.stringify(parsedSubcat));
            }
            
            const { subcategory: subResult, wasNew: wasNewSubcategory } = await ensureSubcategory(parsedSubcat, cat._id);
            sub = subResult;
            if (!sub) {
              // Subcategory creation failed, but continue without it
              console.warn(`Row ${i + 1}: Failed to create/find subcategory: ${parsedSubcat} for category: ${categoryName}`);
            } else {
              // Track subcategory creation
              if (wasNewSubcategory) {
                stats.createdSubcategories++;
              }
            }
          } else if (i < 3) {
            console.log(`[Row ${i + 1}] Failed to parse subcategory from:`, JSON.stringify(subcategoryNameRaw));
          }
        } else if (!cat._id && i < 3) {
          console.log(`[Row ${i + 1}] Skipping subcategory - no category_id (dryRun=${dryRun})`);
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
        const _id = getVal(row, "_id", "id", "ID") || pick(row, "_id", ["id"]);
        const SKU = getVal(row, "SKU", "sku", "Sku") || pick(row, "SKU", ["sku"]);

        if (!_id && !SKU) {
          throw new Error("Missing identity: either _id or SKU is required");
        }

        // 4) Images and gallery
        const product_img =
          getVal(row, "product_img", "productimage", "image", "image_url", "main_img") ||
          pick(row, "product_img", ["image", "image_url", "main_img"]) || "";
        const product_img2 =
          getVal(row, "product_img2", "image2", "image_url2", "sub_img") ||
          pick(row, "product_img2", ["image2", "image_url2", "sub_img"]) || "";
        const gallery_imgs = getGallery(row);
        const tags = getTags(row);

        // 5) Build update doc using your schema fields
        const name = getVal(row, "name", "Name", "product_name", "title") || pick(row, "name", ["product_name", "title"]) || "";
        
        // Price handling - check multiple fields
        const priceRaw = getVal(row, "price", "Price", "sale_price", "Sale price", "mrp", "MRP", "Regular price") || 
                         pick(row, "price", ["sale_price", "mrp"]);
        const price = toNumber(priceRaw);
        
        // MRP handling for priceInfo
        const mrpRaw = getVal(row, "mrp", "MRP", "priceInfo_mrp", "Regular price") || 
                       pick(row, "mrp", ["priceInfo_mrp", "Regular price"]);
        const mrp = toNumber(mrpRaw) || price || 0;
        
        // Sale price handling for priceInfo
        const saleRaw = getVal(row, "priceInfo_sale", "Sale price", "sale_price") || 
                        pick(row, "priceInfo_sale", ["Sale price", "sale_price"]);
        const sale = toNumber(saleRaw) || price || 0;
        
        const stock = toNumber(getVal(row, "stock", "Stock", "qty", "quantity") || pick(row, "stock", ["qty", "quantity"]));
        const is_variant = toBool(
          getVal(row, "is_variant", "isVariant", "variant", "has_variants") ||
          pick(row, "is_variant", ["variant", "has_variants"])
        );
        const brand = getVal(row, "brand", "Brand", "Brands") || pick(row, "brand", []);
        
        // Dimensions
        const length = toNumber(getVal(row, "length", "Length", "dimLength") || pick(row, "length", ["dimLength"]));
        const width = toNumber(getVal(row, "width", "Width", "dimWidth") || pick(row, "width", ["dimWidth"]));
        const height = toNumber(getVal(row, "height", "Height", "dimHeight") || pick(row, "height", ["dimHeight"]));
        
        // Weight
        const weight = toNumber(getVal(row, "weight", "Weight", "Weight (lbs)") || pick(row, "weight", []));
        
        // Additional fields
        const description = getVal(row, "description", "Description", "Short description") || pick(row, "description", []);
        const is_review = toBool(getVal(row, "isReview", "is_review", "Allow customer reviews?") || pick(row, "is_review", ["isReview"]));
        const gstInvoice = toBool(getVal(row, "gstInvoice", "gst_invoice") || pick(row, "gstInvoice", []));
        const deliveryIn1Day = toBool(getVal(row, "deliveryIn1Day", "delivery_in_1_day") || pick(row, "deliveryIn1Day", []));
        const assured = toBool(getVal(row, "assured") || pick(row, "assured", []));
        const bestseller = toBool(getVal(row, "bestseller", "bestseller") || pick(row, "bestseller", []));

        const base = {
          name,
          SKU,
          brand,
          description,
          product_img,
          product_img2,
          gallery_imgs,
          tags,
          price,
          stock,
          weight,
          dimensions: {
            length: length || null,
            width: width || null,
            height: height || null,
          },
          priceInfo: {
            mrp: mrp,
            sale: sale,
          },
          is_variant: Boolean(is_variant),
          is_review: Boolean(is_review),
          gstInvoice: Boolean(gstInvoice),
          deliveryIn1Day: Boolean(deliveryIn1Day),
          assured: Boolean(assured),
          bestseller: Boolean(bestseller),
          seller_id: final || null,
          is_global: Boolean(isGlobal),
          category_id: cat._id || null, // Required field - must be set (null only in dry run)
          subcategory_id: sub && sub._id ? sub._id : null,
        };

        if (dryRun) {
          stats.upserts++;
          continue;
        }

        // Validate required fields before upsert
        if (!base.category_id) {
          console.error(`[Row ${i + 1}] Category ID is null!`, {
            categoryName,
            cat: cat ? { _id: cat._id, name: cat.name } : null,
            dryRun,
            SKU: base.SKU
          });
          throw new Error(`Missing category_id for product: ${base.SKU || base.name}. Category: ${categoryName}, cat._id: ${cat?._id || "null"}`);
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
        const errorMsg = `Row ${i + 1} (SKU: ${row.SKU || row.sku || "N/A"}): ${rowErr.message}`;
        console.error(`[importAllCSV Error] ${errorMsg}`);
        stats.errors.push({ row: i + 1, error: errorMsg, sku: row.SKU || row.sku || "N/A" });
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

    require("../events/productEmitter")
      .emitProductUpsert(product)
      .catch(() => {});
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

       const decorated = await Promise.all(products.map(decorateProduct));
  return res.status(200).json({ products: decorated });
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

    // 1. Validate Mongo ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // 2. Fetch product
    const product = await Product.findById(id).populate(
      "category_id subcategory_id variants seller_id"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Optional pincode check
    if (pincode) {
      const vendor = await Vendor.findById(product.seller_id);
      if (!vendor || vendor.pincode !== pincode) {
        return res
          .status(400)
          .json({ message: "Product not available in this pincode" });
      }
    }

    // 4. Return product (no decoration for now)
    return res.status(200).json(product);

  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ message: "Server error" });
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

    // 🔥 Convert category ids to ObjectId
    if (categories) {
      const categoryArray = categories
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id.trim()));

      filterConditions.category_id = { $in: categoryArray };
    }

    // 🔥 Convert subcategory ids to ObjectId
    if (subcategories) {
      const subcategoryArray = subcategories
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id.trim()));

      filterConditions.subcategory_id = { $in: subcategoryArray };
    }

    if (colors) {
      filterConditions.color = {
        $in: colors.split(",").map((color) => color.trim()),
      };
    }

    if (tags) {
      filterConditions.tags = {
        $in: tags.split(",").map((tag) => tag.trim()),
      };
    }

    if (minPrice || maxPrice) {
      filterConditions.price = {};
      if (minPrice) filterConditions.price.$gte = parseFloat(minPrice);
      if (maxPrice) filterConditions.price.$lte = parseFloat(maxPrice);
    }

    console.log("Filter Conditions:", filterConditions);

    const products = await Product.find(filterConditions)
      .populate("category_id subcategory_id variants seller_id")
      .lean();

    // ✅ Return empty array instead of 404
    return res.status(200).json(products);

  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: err.message });
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

    // require('../events/productEmitter').emitUpsert(updatedProduct).catch(()=>{});

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
      // require('../events/productEmitter').emitUpsert(updatedProduct).catch(()=>{});
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
// exports.importProductsCSV = async (req, res) => {
//   try {
//     // ---------- tiny inline helpers (no external files) ----------
//     const toFilename = (input) => {
//       if (!input && input !== 0) return "";
//       try {
//         const s = String(input).trim();
//         if (!s) return "";
//         const slash = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
//         return slash >= 0 ? s.slice(slash + 1) : s;
//       } catch {
//         return "";
//       }
//     };

//     const splitList = (raw) => {
//       if (!raw) return [];
//       if (Array.isArray(raw))
//         return raw.map((x) => toFilename(x)).filter(Boolean);
//       const s = String(raw).trim();
//       if (!s) return [];
//       return s
//         .split("|")
//         .join(",")
//         .split(",")
//         .map((v) => toFilename(v))
//         .filter(Boolean);
//     };

//     // best-effort CSV parser: prefer existing project parser if available
//     const parseCsvFile = async (absPath) => {
//       try {
//         const fs = require("fs");
//         const { parse } = require("csv-parse/sync");
//         const raw = fs.readFileSync(absPath, "utf8");
//         const records = parse(raw, {
//           columns: true,
//           skip_empty_lines: true,
//           relax_quotes: true,
//           bom: true,
//           trim: true,
//         });
//         return records;
//       } catch {
//         const fs = require("fs");
//         const raw = fs.readFileSync(absPath, "utf8");
//         const lines = raw.split(/\r?\n/).filter(Boolean);
//         if (!lines.length) return [];
//         const headers = lines[0].split(",").map((h) => h.trim());
//         const rows = [];
//         for (let i = 1; i < lines.length; i++) {
//           const cols = lines[i].split(",");
//           const obj = {};
//           headers.forEach((h, idx) => (obj[h] = (cols[idx] || "").trim()));
//           rows.push(obj);
//         }
//         return rows;
//       }
//     };

//     // ---------- get CSV and optional images ZIP from request ----------
//     // Route uses uploadImport.single("file") → file is in req.file (not req.files)
//     // backend/routes/productRoutes.js → uploadImport.single("file") for /import-csv. :contentReference[oaicite:2]{index=2}
//     const csvFileExisting =
//       typeof findFile === "function" ? findFile(req, "csv") : null;
//     const csvFileAlt =
//       (req.files && (req.files.csv || req.files.file || req.files["csv"])) ||
//       null;
//     const csvSingle = req.file || null; // <— NEW: accept single-file multer
//     const csvFileObj = csvFileExisting || csvFileAlt || csvSingle;

//     if (!csvFileObj) {
//       return res.status(400).json({ ok: false, message: "csv file required" });
//     }

//     const imagesZipFile =
//       (req.files && (req.files.images || req.files["images"])) || null;

//     // ---------- optional ZIP extraction → build name→relative path map ----------
//     const imagesMap = new Map();
//     if (imagesZipFile && (imagesZipFile.path || imagesZipFile.buffer)) {
//       const AdmZip = require("adm-zip");
//       const path = require("path");
//       const fs = require("fs");

//       const zip = new AdmZip(imagesZipFile.path || imagesZipFile.buffer);
//       const now = new Date();
//       const year = String(now.getFullYear());
//       const month = String(now.getMonth() + 1).padStart(2, "0");

//       // store under backend/uploads/products/YYYY/MM
//       const outDir = path.join(
//         process.cwd(),
//         "backend",
//         "uploads",
//         "products",
//         year,
//         month
//       );
//       fs.mkdirSync(outDir, { recursive: true });

//       zip.getEntries().forEach((entry) => {
//         if (entry.isDirectory) return;
//         const base = toFilename(entry.entryName);
//         const stamped =
//           `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}`.replace(
//             /\s+/g,
//             "-"
//           );
//         const target = path.join(outDir, stamped);
//         fs.writeFileSync(target, entry.getData());
//         // keep a relative path (from uploads root) so Express static can serve it
//         // final URL becomes /uploads-bbscart/<relative> on the UI
//         const rel = ["products", year, month, stamped].join("/");
//         imagesMap.set(base.toLowerCase(), rel);
//       });
//     }

//     // ---------- parse CSV ----------
//     const csvPath = csvFileObj.path || null;
//     const rows = csvPath ? await parseCsvFile(csvPath) : [];
//     if (!Array.isArray(rows) || rows.length === 0) {
//       return res.json({
//         ok: true,
//         created: 0,
//         updated: 0,
//         note: "CSV parsed but no rows",
//       });
//     }

//     // ---------- upsert products (filenames-only in DB) ----------
//     let created = 0,
//       updated = 0;
//     const nowMs = Date.now();

//     for (const r of rows) {
//       // adapt these to your CSV column names if needed
//       const sku = String(r.sku || r.SKU || r.Sku || "").trim();
//       if (!sku) continue;

//       // Primary image fields
//       let f1 = toFilename(r.product_img || r.image || r.Image || "");
//       let f2 = toFilename(r.product_img2 || r.image2 || r.Image2 || "");

//       // Collect gallery from simple fields
//       const rawGallery =
//         r.gallery_imgs || r.gallery || r.images || r.Gallery || r.Images || [];
//       let galleryList = splitList(rawGallery);

//       // NEW: also collect any indexed columns like gallery_imgs[0], gallery_imgs[1], ...
//       const indexed = Object.keys(r)
//         .filter((k) => /^gallery_imgs\[\d+\]$/i.test(k))
//         .map((k) => toFilename(r[k]))
//         .filter(Boolean);

//       // Merge and uniq while preserving order
//       const seen = new Set();
//       galleryList = [...galleryList, ...indexed].filter((x) => {
//         const key = x.toLowerCase();
//         if (seen.has(key)) return false;
//         seen.add(key);
//         return true;
//       });

//       // ZIP remap: if images were provided via ZIP, map same-named files to extracted relative paths
//       const resolveViaZip = (fn) => {
//         if (!fn) return "";
//         const key = fn.toLowerCase();
//         return imagesMap.get(key) || fn;
//       };

//       let product_img = resolveViaZip(f1);
//       let product_img2 = resolveViaZip(f2);
//       let gallery_resolved = galleryList.map(resolveViaZip).filter(Boolean);

//       // NEW fallbacks: seed product_img and product_img2 from gallery if missing
//       if (!product_img && gallery_resolved.length >= 1)
//         product_img = gallery_resolved[0];
//       if (!product_img2 && gallery_resolved.length >= 2)
//         product_img2 = gallery_resolved[1];

//       // final gallery: if still empty but product_img exists, seed it
//       const gallery_final = gallery_resolved.length
//         ? gallery_resolved
//         : product_img
//           ? [product_img]
//           : [];

//       // build update doc (filenames only in DB)
//       const updateDoc = {
//         name: r.name || r.title || r.product_name || sku,
//         sku,
//         product_img,
//         product_img2,
//         gallery_imgs: gallery_final,
//         // keep your other mappings here if needed (category, price, vendorId, etc.)
//       };

//       const doc = await Product.findOneAndUpdate(
//         { sku },
//         { $set: updateDoc },
//         { upsert: true, new: true, setDefaultsOnInsert: true }
//       );

//       const createdLikely =
//         doc &&
//         doc.createdAt &&
//         nowMs - new Date(doc.createdAt).getTime() < 5000;
//       if (createdLikely) created++;
//       else updated++;
//     }

//     return res.json({ ok: true, created, updated });
//   } catch (err) {
//     console.error("importProductsCSV error:", err);
//     return res.status(500).json({ ok: false, message: "Server error" });
//   }
// };

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
      categoryId,
      subcategoryId,
      groupId,
    } = req.query;

    // Base match: always include globals; add vendor scope if assigned (dual-id/dual-type)
    const baseMatch = buildPublicMatch(req);
    // When categoryId is provided, combine with $and so category filter is never lost
    const rawCategoryId = categoryId && String(categoryId).trim();
    const categoryObjId = rawCategoryId && mongoose.Types.ObjectId.isValid(rawCategoryId)
      ? new mongoose.Types.ObjectId(rawCategoryId)
      : null;
    let match;
  if (categoryObjId) {
  match = { $and: [baseMatch, { category_id: categoryObjId }] };
} else {
  match = baseMatch;   // ✅ FIXED
}


    // Optional filters (keep/extend as you already do)
    if (subcategoryId && mongoose.Types.ObjectId.isValid(subcategoryId)) {
      const subcatObjId = new mongoose.Types.ObjectId(subcategoryId);
      match.subcategory_id = subcatObjId;
      console.log(`[listProducts] Filtering by subcategoryId: ${subcategoryId} (converted to ObjectId: ${subcatObjId})`);
      
      // Debug: Check how many products have this subcategory_id (with and without is_global filter)
      const debugMatch = { subcategory_id: subcatObjId };
      const debugMatchGlobal = { subcategory_id: subcatObjId, is_global: true };
      const [totalWithSubcat, totalWithSubcatAndGlobal] = await Promise.all([
        Product.countDocuments(debugMatch),
        Product.countDocuments(debugMatchGlobal),
      ]);
      console.log(`[listProducts] Debug - Products with subcategory_id ${subcategoryId}:`);
      console.log(`  - Total (any is_global): ${totalWithSubcat}`);
      console.log(`  - With is_global=true: ${totalWithSubcatAndGlobal}`);
      
      // Also check a sample product to see what subcategory_id format they have
      const sampleProduct = await Product.findOne(debugMatch).lean();
      if (sampleProduct) {
        console.log(`[listProducts] Sample product found:`);
        console.log(`  - SKU: ${sampleProduct.SKU}`);
        console.log(`  - subcategory_id type: ${typeof sampleProduct.subcategory_id}`);
        console.log(`  - subcategory_id value: ${sampleProduct.subcategory_id}`);
        console.log(`  - subcategory_id string: ${String(sampleProduct.subcategory_id)}`);
        console.log(`  - is_global: ${sampleProduct.is_global}`);
      } else {
        console.log(`[listProducts] No products found with subcategory_id ${subcategoryId} (even without is_global filter)`);
      }
    } else if (subcategoryId) {
      console.warn(`[listProducts] Invalid subcategoryId format: ${subcategoryId}`);
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

    // Convert ObjectId to string for JSON.stringify
    const matchForLog = {};
    for (const [key, value] of Object.entries(match)) {
      if (value instanceof mongoose.Types.ObjectId) {
        matchForLog[key] = `ObjectId("${value}")`;
      } else {
        matchForLog[key] = value;
      }
    }
    console.log(`[listProducts] Match query:`, JSON.stringify(matchForLog, null, 2));
    
    const [products, total] = await Promise.all([
      Product.find(match).sort(sortStage).skip(skip).limit(take).lean(),
      Product.countDocuments(match),
    ]);

    console.log(`[listProducts] Found ${products.length} products (total: ${total}) for subcategoryId: ${subcategoryId || 'none'}`);
    
    // Additional debug: Check if any products exist with this subcategory_id but different is_global
    if (subcategoryId && mongoose.Types.ObjectId.isValid(subcategoryId) && total === 0) {
      const subcatObjId = new mongoose.Types.ObjectId(subcategoryId);
      const allWithSubcat = await Product.find({ subcategory_id: subcatObjId }).limit(5).lean();
      console.log(`[listProducts] Debug - Found ${allWithSubcat.length} products with subcategory_id (ignoring is_global):`);
      allWithSubcat.forEach((p, idx) => {
        console.log(`  [${idx + 1}] SKU: ${p.SKU}, is_global: ${p.is_global}, subcategory_id: ${String(p.subcategory_id)}`);
      });
    }

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
    const items = await Category.find({}, "name icon slug imageUrl")
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
    const fs = require("fs");
    const path = require("path");
    const AdmZip = require("adm-zip");
    const { parse } = require("csv-parse/sync");
    const mongoose = require("mongoose");
    const Product = require("../models/Product");
    let Media = null;
    try {
      Media = require("../models/Media");
    } catch (_) {}

    // ---------- helpers ----------
    const toFilename = (v) => {
      if (v === undefined || v === null) return "";
      const s = String(v).trim();
      if (!s) return "";
      const i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
      return i >= 0 ? s.slice(i + 1) : s;
    };

    const splitList = (raw) => {
      if (!raw) return [];
      const s = String(raw).trim();
      if (!s) return [];
      const delim = s.includes("|") ? "|" : ",";
      return s
        .split(delim)
        .map((x) => toFilename(x))
        .filter(Boolean);
    };

    const cleanKey = (k) =>
      String(k || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[_-]+/g, "")
        .trim();

    const getVal = (row, ...aliases) => {
      const map = new Map(Object.keys(row).map((k) => [cleanKey(k), k]));
      for (const a of aliases) {
        const hit = map.get(cleanKey(a));
        if (hit && row[hit] != null && String(row[hit]).trim() !== "") {
          return row[hit];
        }
      }
      return "";
    };

    // ---------- detect CSV ----------
    const csvFile =
      req.file || (req.files && (req.files.csv || req.files.file)) || null;
    const csvPath =
      csvFile && (csvFile.path || (Array.isArray(csvFile) && csvFile[0]?.path));
    if (!csvPath)
      return res.status(400).json({ ok: false, message: "CSV file required" });

    // ---------- optional ZIP for images ----------
    const imagesZip =
      (req.files && (req.files.images || req.files["images"])) || null;
    const imagesZipPath =
      imagesZip &&
      (imagesZip.path || (Array.isArray(imagesZip) && imagesZip[0]?.path));
    const imagesMap = new Map();

    if (imagesZipPath) {
      const now = new Date();
      const Y = String(now.getFullYear());
      const M = String(now.getMonth() + 1).padStart(2, "0");
      const outDir = path.join(
        process.cwd(),
        "backend",
        "uploads",
        "products",
        Y,
        M
      );
      fs.mkdirSync(outDir, { recursive: true });

      const zip = new AdmZip(imagesZipPath);
      const mediaOps = [];

      zip.getEntries().forEach((entry) => {
        if (entry.isDirectory) return;
        const base = toFilename(entry.entryName);
        if (!base) return;

        const stamped =
          `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}`.replace(
            /\s+/g,
            "-"
          );
        const target = path.join(outDir, stamped);
        fs.writeFileSync(target, entry.getData());
        imagesMap.set(base.toLowerCase(), stamped);

        if (Media) {
          const ext = path.extname(stamped).toLowerCase();
          const mime =
            ext === ".webm"
              ? "video/webm"
              : ext === ".png"
                ? "image/png"
                : ext === ".jpg" || ext === ".jpeg"
                  ? "image/jpeg"
                  : ext === ".webp"
                    ? "image/webp"
                    : "application/octet-stream";

          mediaOps.push({
            updateOne: {
              filter: { filename: stamped },
              update: {
                $set: {
                  filename: stamped,
                  url: `/uploads/products/${Y}/${M}/${stamped}`,
                  size: entry.header?.size || 0,
                  mime,
                  uploadedBy: req.user?._id || null,
                  updatedAt: new Date(),
                },
                $setOnInsert: { createdAt: new Date() },
              },
              upsert: true,
            },
          });
        }
      });
      if (Media && mediaOps.length)
        await Media.bulkWrite(mediaOps, { ordered: false });
    }

    // ---------- parse CSV ----------
    const raw = fs.readFileSync(csvPath, "utf8");
    const rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
    // ----- Category & Subcategory lookup -----
    const Category = require("../models/Category");
    const Subcategory = require("../models/Subcategory");

    const allCats = await Category.find({}).lean();
    const allSubs = await Subcategory.find({}).lean();

    const catMap = new Map();
    const subMap = new Map();

    for (const c of allCats) {
      if (c.name) catMap.set(c.name.trim().toLowerCase(), c._id);
    }

    for (const s of allSubs) {
      if (s.name) subMap.set(s.name.trim().toLowerCase(), s._id);
    }

    function resolveCategoryId(name) {
      if (!name) return null;
      return catMap.get(String(name).trim().toLowerCase()) || null;
    }

    function resolveSubcategoryId(name) {
      if (!name) return null;
      return subMap.get(String(name).trim().toLowerCase()) || null;
    }

    if (!rows.length)
      return res.json({
        ok: true,
        created: 0,
        updated: 0,
        note: "CSV parsed but no rows",
      });

    const remap = (fn) => {
      if (!fn) return "";
      const hit = imagesMap.get(String(fn).toLowerCase());
      return hit || fn;
    };

    let created = 0,
      updated = 0;
    const nowMs = Date.now();

    // ---------- import loop ----------
    for (const r of rows) {
      const SKU = String(getVal(r, "SKU", "sku", "Sku") || "").trim();
      if (!SKU) continue;

      const mainImgRaw = getVal(
        r,
        "product_img",
        "productimage",
        "imagefile",
        "mainimage"
      );
      const product_img2Raw = getVal(r, "product_img2", "secondaryimage");
      const galleryRaw = getVal(
        r,
        "gallery_imgs",
        "productgallery",
        "galleryimages"
      );

      const product_img = remap(toFilename(mainImgRaw));
      const product_img2 = remap(toFilename(product_img2Raw));
      const gallery_imgs = splitList(galleryRaw).map(remap).filter(Boolean);

      const updateDoc = {
        name: getVal(r, "name", "title", "product_name") || SKU,
        description: getVal(r, "description"),
        SKU,
        brand: getVal(r, "brand"),
        price: Number(getVal(r, "price")) || 0,
        stock: Number(getVal(r, "stock")) || 0,
        weight: getVal(r, "weight") || "",
        is_variant: getVal(r, "is_variant", "isVariant") === "true",
        is_review: getVal(r, "is_review", "isReview") === "true",
        product_img,
        product_img2,
        gallery_imgs,
        tags: (() => {
          const t = getVal(r, "tags");
          if (!t) return [];
          return t.includes("|")
            ? t
                .split("|")
                .map((x) => x.trim())
                .filter(Boolean)
            : [t];
        })(),
        dimensions: {
          length: getVal(r, "dimLength", "length") || "",
          width: getVal(r, "dimWidth", "width") || "",
          height: getVal(r, "dimHeight", "height") || "",
        },
        category_id:
          resolveCategoryId(
            getVal(
              r,
              "category",
              "categoryName",
              "category_name",
              "cat",
              "Category"
            )
          ) || null,

        subcategory_id:
          resolveSubcategoryId(
            getVal(
              r,
              "subcategory",
              "subcategoryName",
              "subcategory_name",
              "subcat",
              "Subcategory"
            )
          ) || null,

        seller_id: (() => {
          const sid = getVal(r, "seller_id", "sellerId");
          if (mongoose.Types.ObjectId.isValid(sid)) return sid;
          if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id))
            return req.user._id;
          return null;
        })(),
      };

      const doc = await Product.findOneAndUpdate(
        { SKU },
        { $set: updateDoc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const isCreated =
        doc &&
        doc.createdAt &&
        nowMs - new Date(doc.createdAt).getTime() < 5000;
      if (isCreated) created++;
      else updated++;
    }

    return res.json({
      ok: true,
      created,
      updated,
      note: "Import completed successfully",
    });
  } catch (err) {
    console.error("importProductsCSV error:", err);
    return res
      .status(500)
      .json({ ok: false, message: err.message || "Server error" });
  }
};

/**
 * Import products CSV and match to existing categories/subcategories by name
 * Products CSV should have tags[0] column with format: "Category Name, Subcategory Name"
 * or separate categoryName and subcategoryName columns
 */
// Utility: Bulk update products to set is_global=true for products with subcategory_id
exports.bulkSetIsGlobal = async (req, res) => {
  try {
    const Product = require("../models/Product");
    const result = await Product.updateMany(
      { 
        subcategory_id: { $exists: true, $ne: null },
        is_global: { $ne: true }
      },
      { 
        $set: { is_global: true }
      }
    );
    
    console.log(`[bulkSetIsGlobal] Updated ${result.modifiedCount} products to set is_global=true`);
    
    return res.json({
      ok: true,
      message: `Updated ${result.modifiedCount} products to set is_global=true`,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error("bulkSetIsGlobal error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

exports.importProductsWithCategoryMatch = async (req, res) => {
  try {
    // Accept multer single or fields: try req.file first, then req.files.file or req.files.csv
    let csvFile = req.file || null;
    if (!csvFile && req.files) {
      if (req.files.file) csvFile = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
      else if (req.files.csv) csvFile = Array.isArray(req.files.csv) ? req.files.csv[0] : req.files.csv;
    }
    if (!csvFile) {
      return res.status(400).json({ ok: false, error: "File missing (field name: file)." });
    }
    // normalize so later code can use req.file
    req.file = csvFile;

    const dryRun = String(req.query.dryRun || "").toLowerCase() === "true";

    // Helper functions (same as importAllCSV)
    const cleanKey = (k) => {
      return String(k || "")
        .replace(/^\uFEFF/, "") // Remove BOM
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, "")
        .replace(/\n+/g, ""); // Remove newlines
    };

    const getVal = (row, ...names) => {
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
    };

    const pick = (row, main, alts = []) => {
      const val = getVal(row, main, ...alts);
      if (val !== "") return val;
      if (row[main] != null && row[main] !== "") return row[main];
      for (const k of alts) if (row[k] != null && row[k] !== "") return row[k];
      return undefined;
    };

    // Parse CSV or Excel file
    let rows = [];
    const fileExt = path.extname(req.file.originalname || req.file.filename || "").toLowerCase();
    
    if (fileExt === ".xlsx" || fileExt === ".xls") {
      // Handle Excel files
      const XLSX = require("xlsx");
      let workbook;
      if (req.file.path && fs.existsSync(req.file.path)) {
        // File saved to disk
        workbook = XLSX.readFile(req.file.path);
      } else if (req.file.buffer) {
        // File in memory buffer
        workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      } else {
        throw new Error("Excel file not found in path or buffer");
      }
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
      console.log(`[importProductsWithCategoryMatch] Parsed Excel file: ${rows.length} rows from sheet "${sheetName}"`);
    } else {
      // Handle CSV files
      const csvText = req.file.buffer
        ? req.file.buffer.toString("utf8")
        : fs.readFileSync(req.file.path, "utf8");
      rows = parse(csvText, { columns: true, skip_empty_lines: true });
      console.log(`[importProductsWithCategoryMatch] Parsed CSV file: ${rows.length} rows`);
    }

    if (!rows.length) {
      return res.json({ ok: true, message: "No rows found in file", updated: 0, errors: [] });
    }

    // Load all categories and subcategories from DB
    const [allCats, allSubs] = await Promise.all([
      Category.find({}).lean(),
      Subcategory.find({}).lean(),
    ]);

    // Build lookup maps by name (case-insensitive)
    const catByName = new Map();
    const catById = new Map();
    for (const c of allCats) {
      if (c._id) {
        catById.set(String(c._id), c);
        const nameLower = String(c.name).toLowerCase().trim();
        // Store exact name
        catByName.set(nameLower, c);
        // Also add variations for plural/singular matching
        if (nameLower.endsWith('s')) {
          // "Frozen Foods" -> also store as "Frozen Food"
          catByName.set(nameLower.slice(0, -1), c);
        } else {
          // "Frozen Food" -> also store as "Frozen Foods"
          catByName.set(nameLower + 's', c);
        }
        // Also try with "ies" -> "y" (e.g., "Categories" -> "Category")
        if (nameLower.endsWith('ies')) {
          catByName.set(nameLower.slice(0, -3) + 'y', c);
        } else if (nameLower.endsWith('y')) {
          catByName.set(nameLower.slice(0, -1) + 'ies', c);
        }
      }
    }

    const subByName = new Map();
    const subById = new Map();
    const subByCategoryAndName = new Map(); // For faster lookup: "categoryId:subcategoryName"
    for (const s of allSubs) {
      if (s._id) {
        subById.set(String(s._id), s);
        const nameLower = String(s.name).toLowerCase().trim();
        // Store exact name
        subByName.set(nameLower, s);
        // Also add variations for plural/singular matching
        if (nameLower.endsWith('s')) {
          subByName.set(nameLower.slice(0, -1), s);
        } else {
          subByName.set(nameLower + 's', s);
        }
        // Also try with "ies" -> "y"
        if (nameLower.endsWith('ies')) {
          subByName.set(nameLower.slice(0, -3) + 'y', s);
        } else if (nameLower.endsWith('y')) {
          subByName.set(nameLower.slice(0, -1) + 'ies', s);
        }
        // Index by category_id + name for faster lookup
        if (s.category_id) {
          const key = `${String(s.category_id)}:${nameLower}`;
          subByCategoryAndName.set(key, s);
          // Also add plural/singular variations
          if (nameLower.endsWith('s')) {
            subByCategoryAndName.set(`${String(s.category_id)}:${nameLower.slice(0, -1)}`, s);
          } else {
            subByCategoryAndName.set(`${String(s.category_id)}:${nameLower}s`, s);
          }
        }
      }
    }

    console.log(`[importProductsWithCategoryMatch] Loaded ${allCats.length} categories, ${allSubs.length} subcategories`);
    // Optional: extract images ZIP (field name: 'images') if provided alongside the CSV
    // Build two maps: 1) full-filename → URL, 2) base-name (without timestamp/ext) → filename for fuzzy matching
    const imagesMap = new Map(); // exact filename -> /uploads/... URL
    const imagesByBaseName = new Map(); // base-name (e.g., "BBS_BPC_PF_MDII_175") -> { filename, url }
    
    try {
      const imagesFile = (req.files && (req.files.images || req.files["images"])) || null;
      const imagesPath = imagesFile && (imagesFile.path || (Array.isArray(imagesFile) && imagesFile[0]?.path));
      if (imagesPath) {
        let Media = null;
        try {
          Media = require("../models/Media");
        } catch (_) {}

        const now = new Date();
        const Y = String(now.getFullYear());
        const M = String(now.getMonth() + 1).padStart(2, "0");
        const outDir = path.join(process.cwd(), "backend", "uploads", "products", Y, M);
        fs.mkdirSync(outDir, { recursive: true });

        const zip = new AdmZip(imagesPath);
        const mediaOps = [];

        const toFilename = (v) => {
          if (!v && v !== 0) return "";
          const s = String(v).trim();
          if (!s) return "";
          const slash = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
          return slash >= 0 ? s.slice(slash + 1) : s;
        };

        // Helper to extract base name: strip extension and any trailing timestamp pattern
        // E.g., "BBS_BPC_PF_MDII_175-1770358602294.webp" -> "BBS_BPC_PF_MDII_175"
        const extractBaseName = (filename) => {
          // Remove extension first
          const noExt = filename.replace(/\.[^.]+$/, "");
          // Remove trailing -<timestamp> where timestamp is 10+ digits (Unix milliseconds)
          return noExt.replace(/-\d{10,}$/, "");
        };

        zip.getEntries().forEach((entry) => {
          if (entry.isDirectory) return;
          const originalName = toFilename(entry.entryName);
          if (!originalName) return;
          
          // Extract base name for matching & filename storage
          const baseName = extractBaseName(originalName);
          const ext = path.extname(originalName);
          
          // Use clean base name + extension: BBC_BC_BSII_8.webp (no timestamps)
          const stamped = `${baseName}${ext}`.replace(/\s+/g, "-");
          const target = path.join(outDir, stamped);
          fs.writeFileSync(target, entry.getData());
          
          // store public relative URL
          const rel = `/uploads/products/${Y}/${M}/${stamped}`;
          
          // Map 1: exact filename (original from ZIP)
          imagesMap.set(originalName.toLowerCase(), rel);
          
          // Map 2: base name -> actual uploaded filename + URL (for fuzzy matching)
          if (baseName) {
            imagesByBaseName.set(baseName.toLowerCase(), { filename: stamped, url: rel });
            if (Object.keys(row).length > 0 && row.SKU) { // Log for actual data rows only
              console.log(`[ZIP extraction] File: "${originalName}" -> Base: "${baseName}" -> Stored: "${stamped}" -> URL: "${rel}"`);
            }
          }

          if (Media) {
            const ext = path.extname(stamped).toLowerCase();
            const mime =
              ext === ".webm"
                ? "video/webm"
                : ext === ".png"
                ? "image/png"
                : ext === ".jpg" || ext === ".jpeg"
                ? "image/jpeg"
                : ext === ".webp"
                ? "image/webp"
                : "application/octet-stream";

            mediaOps.push({
              updateOne: {
                filter: { filename: stamped },
                update: {
                  $set: {
                    filename: stamped,
                    url: rel,
                    size: entry.header?.size || 0,
                    mime,
                    uploadedBy: req.user?._id || null,
                    updatedAt: new Date(),
                  },
                  $setOnInsert: { createdAt: new Date() },
                },
                upsert: true,
              },
            });
          }
        });

        if (mediaOps.length && typeof Media?.bulkWrite === "function") {
          await Media.bulkWrite(mediaOps, { ordered: false });
        }
      }
    } catch (zipErr) {
      console.error("import-with-category-match: images zip processing failed:", zipErr);
    }
    
    // Log all category/subcategory names in database for comparison
    const dbCategoryNames = allCats.map(c => c.name).sort();
    const dbSubcategoryNames = allSubs.map(s => s.name).sort();
    console.log(`[importProductsWithCategoryMatch] Database Categories (${dbCategoryNames.length}):`, dbCategoryNames.slice(0, 20));
    if (dbCategoryNames.length > 20) {
      console.log(`  ... and ${dbCategoryNames.length - 20} more categories`);
    }
    console.log(`[importProductsWithCategoryMatch] Database Subcategories (${dbSubcategoryNames.length}):`, dbSubcategoryNames.slice(0, 20));
    if (dbSubcategoryNames.length > 20) {
      console.log(`  ... and ${dbSubcategoryNames.length - 20} more subcategories`);
    }

    // Helper to parse category path (extract actual category name from full path)
    const parseCategoryPath = (pathStr) => {
      if (!pathStr) return null;
      const str = String(pathStr).trim();
      if (!str) return null;
      
      // If it's a simple name (no ">"), return as-is
      if (!str.includes(">")) return str;
      
      // Split by comma first (in case multiple paths are provided)
      const paths = str.split(",").map(p => p.trim()).filter(Boolean);
      if (paths.length === 0) return null;
      
      // Take the first path and extract the category name
      const firstPath = paths[0];
      
      // If it contains ">", extract the second level (category)
      // Format: "HyperMarket > Beauty and Personal Care > Facial Care > Refreshing Face Wash"
      // We want: "Beauty and Personal Care"
      if (firstPath.includes(">")) {
        const parts = firstPath.split(">").map(p => p.trim()).filter(Boolean);
        // Return the second part (category) if available, otherwise first part
        return parts.length >= 2 ? parts[1] : parts[0];
      }
      
      return firstPath;
    };

    // Helper to parse subcategory from path or comma-separated
    const parseSubcategoryFromPath = (pathStr) => {
      if (!pathStr) return null;
      const str = String(pathStr).trim();
      if (!str) return null;
      
      // If it's a simple name (no ">" and no comma), return as-is
      if (!str.includes(">") && !str.includes(",")) return str;
      
      // Split by comma first
      const parts = str.split(",").map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return null;
      
      // Take the last part (usually the most specific subcategory)
      const lastPart = parts[parts.length - 1];
      
      // If it contains ">", extract the last part
      if (lastPart.includes(">")) {
        const pathParts = lastPart.split(">").map(p => p.trim()).filter(Boolean);
        return pathParts[pathParts.length - 1];
      }
      
      return lastPart;
    };

    // Helper to extract category/subcategory from tags or columns
    const extractCategorySubcategory = (row) => {
      // PRIORITY 1: Parse from tags column (simple names like "Beverages, Fresh Juices")
      const tagsRaw = getVal(row, "tags[0]", "tags", "Tags", "tag");
      let categoryName = null;
      let subcategoryName = null;
      
      if (tagsRaw && tagsRaw !== "") {
        const tags = String(tagsRaw).split(",").map(t => t.trim()).filter(Boolean);
        
        // Parse tags: typically "Category, Subcategory" format
        if (tags.length >= 1) {
          categoryName = tags[0];
        }
        if (tags.length >= 2) {
          subcategoryName = tags[1];
        } else if (tags.length === 1) {
          // Only one tag - could be category or subcategory
          // We'll treat it as subcategory if categoryName column exists
          subcategoryName = tags[0];
        }
      }

      // PRIORITY 2: If tags didn't give us category, try categoryName column
      // But parse the path to extract actual category name
      if (!categoryName || categoryName === "") {
        const categoryNameRaw = getVal(row, "categoryName", "category", "Category", "Categories");
        if (categoryNameRaw && categoryNameRaw !== "") {
          // Parse the path to extract category name
          categoryName = parseCategoryPath(categoryNameRaw);
        }
      }

      // PRIORITY 3: If tags didn't give us subcategory, try subcategoryName column
      if (!subcategoryName || subcategoryName === "") {
        const subcategoryNameRaw = getVal(row, "subcategoryName", "subcategory", "Subcategory", "Subcategories");
        if (subcategoryNameRaw && subcategoryNameRaw !== "") {
          // Parse the path to extract subcategory name
          subcategoryName = parseSubcategoryFromPath(subcategoryNameRaw);
        }
      }

      // Final normalization
      if (categoryName === "") categoryName = null;
      if (subcategoryName === "") subcategoryName = null;

      return { categoryName, subcategoryName };
    };

    // Helper to find category by name (fuzzy matching)
    const findCategoryByName = (name) => {
      if (!name) return null;
      const nameLower = String(name).toLowerCase().trim();
      
      // Exact match (handles plural/singular variations already in map)
      if (catByName.has(nameLower)) {
        return catByName.get(nameLower);
      }
      
      // Try word-by-word matching for compound names
      // e.g., "Frozen Food" should match "Frozen Foods"
      const words = nameLower.split(/\s+/);
      if (words.length > 1) {
        // Try matching last word with plural/singular
        const lastWord = words[words.length - 1];
        const restWords = words.slice(0, -1).join(' ');
        
        // Try with 's' added/removed on last word
        if (lastWord.endsWith('s')) {
          const singularLast = lastWord.slice(0, -1);
          const tryMatch = `${restWords} ${singularLast}`.trim();
          if (catByName.has(tryMatch)) {
            return catByName.get(tryMatch);
          }
        } else {
          const pluralLast = lastWord + 's';
          const tryMatch = `${restWords} ${pluralLast}`.trim();
          if (catByName.has(tryMatch)) {
            return catByName.get(tryMatch);
          }
        }
      }
      
      // Try partial match (contains) - but prefer longer matches
      let bestMatch = null;
      let bestMatchLength = 0;
      for (const [key, cat] of catByName.entries()) {
        if (key === nameLower) {
          return cat; // Exact match
        }
        if (key.includes(nameLower) || nameLower.includes(key)) {
          const matchLength = Math.min(key.length, nameLower.length);
          if (matchLength > bestMatchLength) {
            bestMatch = cat;
            bestMatchLength = matchLength;
          }
        }
      }
      
      return bestMatch;
    };

    // Helper to find subcategory by name (fuzzy matching)
    const findSubcategoryByName = (name, categoryId = null) => {
      if (!name) return null;
      const nameLower = String(name).toLowerCase().trim();
      
      // If categoryId provided, try category-specific lookup first
      if (categoryId) {
        const key = `${String(categoryId)}:${nameLower}`;
        if (subByCategoryAndName.has(key)) {
          return subByCategoryAndName.get(key);
        }
        // Try with plural/singular variation
        if (nameLower.endsWith('s')) {
          const key2 = `${String(categoryId)}:${nameLower.slice(0, -1)}`;
          if (subByCategoryAndName.has(key2)) {
            return subByCategoryAndName.get(key2);
          }
        } else {
          const key2 = `${String(categoryId)}:${nameLower}s`;
          if (subByCategoryAndName.has(key2)) {
            return subByCategoryAndName.get(key2);
          }
        }
      }
      
      // Exact match (handles plural/singular variations already in map)
      if (subByName.has(nameLower)) {
        const sub = subByName.get(nameLower);
        // If categoryId provided, verify it matches
        if (!categoryId || String(sub.category_id) === String(categoryId)) {
          return sub;
        }
      }
      
      // Try word-by-word matching for compound names
      const words = nameLower.split(/\s+/);
      if (words.length > 1) {
        const lastWord = words[words.length - 1];
        const restWords = words.slice(0, -1).join(' ');
        
        if (lastWord.endsWith('s')) {
          const singularLast = lastWord.slice(0, -1);
          const tryMatch = `${restWords} ${singularLast}`.trim();
          if (subByName.has(tryMatch)) {
            const sub = subByName.get(tryMatch);
            if (!categoryId || String(sub.category_id) === String(categoryId)) {
              return sub;
            }
          }
        } else {
          const pluralLast = lastWord + 's';
          const tryMatch = `${restWords} ${pluralLast}`.trim();
          if (subByName.has(tryMatch)) {
            const sub = subByName.get(tryMatch);
            if (!categoryId || String(sub.category_id) === String(categoryId)) {
              return sub;
            }
          }
        }
      }
      
      // Try partial match (contains) - but prefer longer matches
      let bestMatch = null;
      let bestMatchLength = 0;
      for (const [key, sub] of subByName.entries()) {
        // If categoryId provided, verify it matches
        if (categoryId && String(sub.category_id) !== String(categoryId)) {
          continue;
        }
        if (key === nameLower) {
          return sub; // Exact match
        }
        if (key.includes(nameLower) || nameLower.includes(key)) {
          const matchLength = Math.min(key.length, nameLower.length);
          if (matchLength > bestMatchLength) {
            bestMatch = sub;
            bestMatchLength = matchLength;
          }
        }
      }
      
      return bestMatch;
    };

    // Helper to create category if missing
    const ensureCategoryExists = async (categoryName) => {
      if (!categoryName) return null;
      
      // First try to find existing
      let category = findCategoryByName(categoryName);
      if (category) return category;
      
      // Create new category
      if (dryRun) {
        console.log(`[DRY RUN] Would create category: "${categoryName}"`);
        return { _id: null, name: categoryName };
      }
      
      try {
        const newCategory = await Category.create({ name: categoryName });
        // Update lookup maps
        const nameLower = String(categoryName).toLowerCase().trim();
        catByName.set(nameLower, newCategory);
        catById.set(String(newCategory._id), newCategory);
        // Add variations
        if (nameLower.endsWith('s')) {
          catByName.set(nameLower.slice(0, -1), newCategory);
        } else {
          catByName.set(nameLower + 's', newCategory);
        }
        console.log(`Created new category: "${categoryName}" (${String(newCategory._id)})`);
        return newCategory;
      } catch (err) {
        console.error(`Failed to create category "${categoryName}":`, err.message);
        return null;
      }
    };

    // Helper to create subcategory if missing
    const ensureSubcategoryExists = async (subcategoryName, categoryId) => {
      if (!subcategoryName) return null;
      
      // First try to find existing
      let subcategory = findSubcategoryByName(subcategoryName, categoryId);
      if (subcategory) return subcategory;
      
      // Need category_id to create subcategory
      if (!categoryId) {
        console.warn(`Cannot create subcategory "${subcategoryName}" without category_id`);
        return null;
      }
      
      // Create new subcategory
      if (dryRun) {
        console.log(`[DRY RUN] Would create subcategory: "${subcategoryName}" for category: ${String(categoryId)}`);
        return { _id: null, name: subcategoryName, category_id: categoryId };
      }
      
      try {
        const newSubcategory = await Subcategory.create({ 
          name: subcategoryName, 
          category_id: categoryId 
        });
        // Update lookup maps
        const nameLower = String(subcategoryName).toLowerCase().trim();
        subByName.set(nameLower, newSubcategory);
        subById.set(String(newSubcategory._id), newSubcategory);
        // Add variations
        if (nameLower.endsWith('s')) {
          subByName.set(nameLower.slice(0, -1), newSubcategory);
        } else {
          subByName.set(nameLower + 's', newSubcategory);
        }
        // Index by category_id + name
        const key = `${String(categoryId)}:${nameLower}`;
        subByCategoryAndName.set(key, newSubcategory);
        console.log(`Created new subcategory: "${subcategoryName}" (${String(newSubcategory._id)}) for category: ${String(categoryId)}`);
        return newSubcategory;
      } catch (err) {
        console.error(`Failed to create subcategory "${subcategoryName}":`, err.message);
        return null;
      }
    };

    // Track all unique category/subcategory names from CSV for mismatch analysis
    const csvCategoryNames = new Set();
    const csvSubcategoryNames = new Set();
    const categoryMismatches = new Map(); // CSV name -> closest DB match
    const subcategoryMismatches = new Map();

    const stats = {
      updated: 0,
      created: 0,
      skipped: 0,
      errors: [],
      createdCategories: 0,
      createdSubcategories: 0,
      missingCategories: new Set(),
      missingSubcategories: new Set(),
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        const SKU = getVal(row, "SKU", "sku", "Sku") || pick(row, "SKU", ["sku"]);
        if (!SKU) {
          stats.skipped++;
          continue;
        }

        // Extract category and subcategory names
        const { categoryName, subcategoryName } = extractCategorySubcategory(row);

        // Track CSV names for mismatch analysis
        if (categoryName) csvCategoryNames.add(categoryName);
        if (subcategoryName) csvSubcategoryNames.add(subcategoryName);

        // Debug logging for first few rows
        if (i < 10) {
          const tagsRaw = getVal(row, "tags[0]", "tags", "Tags", "tag");
          console.log(`[Row ${i + 1}] SKU: ${SKU}`);
          console.log(`[Row ${i + 1}] Tags from file:`, JSON.stringify(tagsRaw));
          console.log(`[Row ${i + 1}] Extracted categoryName:`, JSON.stringify(categoryName));
          console.log(`[Row ${i + 1}] Extracted subcategoryName:`, JSON.stringify(subcategoryName));
        }

        // Find or create category
        let category = null;
        if (categoryName) {
          category = findCategoryByName(categoryName);
          if (!category) {
            // Track mismatch for reporting
            if (!categoryMismatches.has(categoryName)) {
              // Find closest match in DB
              const closestMatch = dbCategoryNames.find(dbName => 
                dbName.toLowerCase().includes(categoryName.toLowerCase()) ||
                categoryName.toLowerCase().includes(dbName.toLowerCase())
              );
              categoryMismatches.set(categoryName, closestMatch || "NO_MATCH");
            }
            
            // Auto-create missing category
            category = await ensureCategoryExists(categoryName);
            if (category && category._id) {
              stats.createdCategories++;
            } else if (!category) {
              stats.missingCategories.add(categoryName);
              if (i < 10) {
                console.log(`[Row ${i + 1}] Failed to create category: "${categoryName}" (SKU: ${SKU})`);
              }
            }
          } else if (i < 5) {
            console.log(`[Row ${i + 1}] Found category: "${category.name}" (${String(category._id)}) for "${categoryName}"`);
          }
        }

        // Find or create subcategory (prefer within found category)
        let subcategory = null;
        if (subcategoryName) {
          const searchCategoryId = category?._id || null;
          subcategory = findSubcategoryByName(subcategoryName, searchCategoryId);
          
          if (!subcategory) {
            // Try finding without category constraint first
            if (category) {
              subcategory = findSubcategoryByName(subcategoryName);
            }
            
            // Track mismatch for reporting
            if (!subcategory && !subcategoryMismatches.has(subcategoryName)) {
              // Find closest match in DB
              const closestMatch = dbSubcategoryNames.find(dbName => 
                dbName.toLowerCase().includes(subcategoryName.toLowerCase()) ||
                subcategoryName.toLowerCase().includes(dbName.toLowerCase())
              );
              subcategoryMismatches.set(subcategoryName, closestMatch || "NO_MATCH");
            }
            
            // If still not found, create it
            if (!subcategory && category && category._id) {
              subcategory = await ensureSubcategoryExists(subcategoryName, category._id);
              if (subcategory && subcategory._id) {
                stats.createdSubcategories++;
              } else if (!subcategory) {
                stats.missingSubcategories.add(subcategoryName);
                if (i < 10) {
                  console.log(`[Row ${i + 1}] Failed to create subcategory: "${subcategoryName}" (category: ${category?.name || "any"}, SKU: ${SKU})`);
                }
              }
            } else if (!subcategory) {
              stats.missingSubcategories.add(subcategoryName);
              if (i < 10) {
                console.log(`[Row ${i + 1}] Subcategory not found and cannot create (no category): "${subcategoryName}" (SKU: ${SKU})`);
              }
            }
          } else if (i < 5) {
            console.log(`[Row ${i + 1}] Found subcategory: "${subcategory.name}" (${String(subcategory._id)}) for "${subcategoryName}"`);
          }
        }

        // Build update object - only include if we have valid _id
        const updateDoc = {};
        if (category && category._id) {
          updateDoc.category_id = category._id;
        }
        if (subcategory && subcategory._id) {
          updateDoc.subcategory_id = subcategory._id;
        }

        // Map image filenames (from CSV) to extracted ZIP URLs when available
        const toFilename = (v) => {
          if (!v && v !== 0) return "";
          try {
            const s = String(v).trim();
            if (!s) return "";
            const idx = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
            return idx >= 0 ? s.slice(idx + 1) : s;
          } catch {
            return "";
          }
        };

        const mainImgRawRow = getVal(row, "product_img", "productimage", "image", "image_url", "main_img") || pick(row, "product_img", ["image", "image_url", "main_img"]);
        const secImgRawRow = getVal(row, "product_img2", "image2", "image_url2", "sub_img") || pick(row, "product_img2", ["image2", "image_url2", "sub_img"]);
        const galleryRawRow = getVal(row, "gallery_imgs", "gallery", "images", "productGallery") || pick(row, "gallery_imgs", ["gallery", "images"]);

        // Keep CSV filenames as-is (with or without extension) for base-name matching
        const mainBase = String(mainImgRawRow || "").trim();
        const secBase = String(secImgRawRow || "").trim();
        let galleryList = [];
        if (galleryRawRow) {
          const s = String(galleryRawRow || "");
          const delim = s.includes("|") ? "|" : ",";
          galleryList = s.split(delim).map((x) => String(x || "").trim()).filter(Boolean);
        }
        // also include indexed gallery fields like gallery_imgs[0]
        Object.keys(row)
          .filter((k) => /^gallery_imgs\[\d+\]$/i.test(k))
          .sort((a, b) => Number(a.match(/\[(\d+)\]/)[1]) - Number(b.match(/\[(\d+)\]/)[1]))
          .forEach((k) => {
            const v = String(row[k] || "").trim();
            if (v) galleryList.push(v);
          });

        // Resolve image filename: try exact match, then base-name match
        const resolveImg = (fn) => {
          if (!fn) return "";
          const fnLower = String(fn).toLowerCase();
          
          // Try 1: exact match (e.g., "BBC_FF_FVG_1.webp" exactly)
          if (imagesMap.has(fnLower)) {
            return imagesMap.get(fnLower);
          }
          
          // Try 2: base-name match after removing extension
          // E.g., CSV says "BBS_BPC_PF_MDII_175" or "BBS_BPC_PF_MDII_175.webp"
          // Match to uploaded "BBS_BPC_PF_MDII_175-1770358602294.webp"
          const baseForMatch = String(fn).replace(/\.[^.]*$/, "").toLowerCase(); // remove extension
          if (imagesByBaseName.has(baseForMatch)) {
            return imagesByBaseName.get(baseForMatch).url;
          }
          
          // Not found -> return original (CSV name as fallback)
          return fn;
        };

        const mappedMain = resolveImg(mainBase) || undefined;
        const mappedSec = resolveImg(secBase) || undefined;
        const mappedGallery = Array.from(new Set(galleryList.map(resolveImg).filter(Boolean)));

        // Store the resolved image URLs in updateDoc
        if (mappedMain) {
          updateDoc.product_img = mappedMain;
          if (i < 5) console.log(`[Row ${i + 1}] Mapped product_img: "${mainBase}" -> "${mappedMain}"`);
        }
        if (mappedSec) {
          updateDoc.product_img2 = mappedSec;
          if (i < 5) console.log(`[Row ${i + 1}] Mapped product_img2: "${secBase}" -> "${mappedSec}"`);
        }
        if (mappedGallery.length) {
          updateDoc.gallery_imgs = mappedGallery;
          if (i < 5) console.log(`[Row ${i + 1}] Mapped gallery_imgs (${galleryList.length} items):`, galleryList.map((g, idx) => `"${g}" -> "${mappedGallery[idx]}"`).join(", "));
        }

        // In dry run mode, also count mock objects (for reporting purposes)
        if (dryRun) {
          const dryRunUpdateDoc = {};
          if (category) {
            // In dry run, use mock _id or actual _id
            dryRunUpdateDoc.category_id = category._id || "WOULD_CREATE";
          }
          if (subcategory) {
            dryRunUpdateDoc.subcategory_id = subcategory._id || "WOULD_CREATE";
          }
          
          // Only count as "would update" if we have at least category or subcategory
          if (category || subcategory) {
            stats.updated++;
            if (i < 5) {
              console.log(`[Row ${i + 1}] [DRY RUN] Would update SKU: ${SKU}`, JSON.stringify(dryRunUpdateDoc, null, 2));
            }
          } else {
            stats.skipped++;
            if (i < 10) {
              console.log(`[Row ${i + 1}] [DRY RUN] SKU: ${SKU} - Would skip (no category/subcategory)`);
            }
          }
          continue;
        }

        // Skip if no updates needed (actual mode - must have valid _id)
        if (Object.keys(updateDoc).length === 0) {
          stats.skipped++;
          if (i < 10) {
            console.log(`[Row ${i + 1}] SKU: ${SKU} - Skipping because no category/subcategory found or extracted`);
            console.log(`[Row ${i + 1}]   - categoryName: ${categoryName || "null"}`);
            console.log(`[Row ${i + 1}]   - subcategoryName: ${subcategoryName || "null"}`);
            console.log(`[Row ${i + 1}]   - category found: ${category ? (category._id ? `yes (${String(category._id)})` : "yes but _id is null") : "no"}`);
            console.log(`[Row ${i + 1}]   - subcategory found: ${subcategory ? (subcategory._id ? `yes (${String(subcategory._id)})` : "yes but _id is null") : "no"}`);
          }
          continue;
        }

        // Check if product exists
        const existingProduct = await Product.findOne({ SKU }).lean();
        if (!existingProduct) {
          // Product doesn't exist - create it with category/subcategory IDs
          // IMPORTANT: category_id is required, so we can only create if we have it
          if (updateDoc.category_id) {
            try {
              const newProduct = {
                SKU,
                name: getVal(row, "name", "Name", "product_name", "Product Name") || SKU,
                description: getVal(row, "description", "Description", "desc") || "",
                price: parseFloat(getVal(row, "price", "Price") || 0) || 0,
                stock: parseInt(getVal(row, "stock", "Stock", "quantity", "Quantity") || 0) || 0,
                brand: getVal(row, "brand", "Brand") || "",
                product_img: updateDoc.product_img || "",
                product_img2: updateDoc.product_img2 || "",
                gallery_imgs: updateDoc.gallery_imgs || [],
                category_id: updateDoc.category_id, // Required field
                subcategory_id: updateDoc.subcategory_id || null,
                is_global: true, // IMPORTANT: Set to true so products appear in public listings
                created_at: new Date(),
                updated_at: new Date(),
              };
              
              await Product.create(newProduct);
              stats.created++;
              if (i < 10) {
                console.log(`[Row ${i + 1}] ✅ Created new product SKU: ${SKU} with category/subcategory IDs`);
                console.log(`[Row ${i + 1}]   - category_id=${String(updateDoc.category_id)}`);
                console.log(`[Row ${i + 1}]   - subcategory_id=${updateDoc.subcategory_id ? String(updateDoc.subcategory_id) : "null"}`);
              }
            } catch (createErr) {
              stats.errors.push({ row: i + 1, error: `Failed to create product: ${createErr.message}`, sku: SKU });
              console.error(`[Row ${i + 1}] Failed to create product SKU: ${SKU}`, createErr.message);
              if (i < 10) {
                console.error(`[Row ${i + 1}]   - category_id=${updateDoc.category_id ? String(updateDoc.category_id) : "MISSING"}`);
                console.error(`[Row ${i + 1}]   - subcategory_id=${updateDoc.subcategory_id ? String(updateDoc.subcategory_id) : "null"}`);
              }
            }
          } else {
            stats.skipped++;
            if (i < 10) {
              console.log(`[Row ${i + 1}] SKU: ${SKU} - Product not found and no category_id to set (required), skipping`);
              console.log(`[Row ${i + 1}]   - categoryName: ${categoryName || "null"}`);
              console.log(`[Row ${i + 1}]   - category found: ${category ? (category._id ? `yes (${String(category._id)})` : "yes but _id is null") : "no"}`);
            }
          }
          continue;
        }

        // Compare existing vs new values
        const existingCatId = existingProduct.category_id ? String(existingProduct.category_id) : null;
        const existingSubId = existingProduct.subcategory_id ? String(existingProduct.subcategory_id) : null;
        const newCatId = updateDoc.category_id ? String(updateDoc.category_id) : null;
        const newSubId = updateDoc.subcategory_id ? String(updateDoc.subcategory_id) : null;
        
        // Check if product needs update (IDs changed OR is_global is false)
        const needsUpdate = 
          existingCatId !== newCatId || 
          existingSubId !== newSubId ||
          existingProduct.is_global !== true;
        
        if (!needsUpdate && existingCatId === newCatId && existingSubId === newSubId) {
          stats.skipped++;
          if (i < 10) {
            console.log(`[Row ${i + 1}] SKU: ${SKU} already has correct category/subcategory IDs and is_global=true, skipping`);
            console.log(`[Row ${i + 1}]   - Existing: category_id=${existingCatId || "null"}, subcategory_id=${existingSubId || "null"}, is_global=${existingProduct.is_global}`);
          }
          continue;
        }

        // Log what will be updated
        if (i < 10) {
          console.log(`[Row ${i + 1}] SKU: ${SKU} - Will update:`);
          console.log(`[Row ${i + 1}]   - From: category_id=${existingCatId || "null"}, subcategory_id=${existingSubId || "null"}, is_global=${existingProduct.is_global}`);
          console.log(`[Row ${i + 1}]   - To: category_id=${newCatId || "null"}, subcategory_id=${newSubId || "null"}, is_global=true`);
        }

        // Update product (use updateDoc directly, it already has valid _ids)
        // Also ensure is_global is set to true so products appear in public listings
        const finalUpdateDoc = {
          ...updateDoc,
          is_global: true, // Ensure products are visible in public listings
        };
        
        const result = await Product.updateOne(
          { SKU },
          { $set: finalUpdateDoc }
        );

        if (result.matchedCount > 0) {
          stats.updated++;
          if (i < 10) {
            const logDoc = {
              category_id: updateDoc.category_id ? String(updateDoc.category_id) : null,
              subcategory_id: updateDoc.subcategory_id ? String(updateDoc.subcategory_id) : null,
              matchedCount: result.matchedCount,
              modifiedCount: result.modifiedCount,
            };
            console.log(`[Row ${i + 1}] ✅ Updated SKU: ${SKU}`, JSON.stringify(logDoc, null, 2));
          }
          
          // Warn if matched but not modified (shouldn't happen with our check above, but just in case)
          if (result.modifiedCount === 0 && i < 10) {
            console.warn(`[Row ${i + 1}] SKU: ${SKU} matched but not modified - values may already be set`);
          }
        } else {
          stats.skipped++;
          if (i < 10) {
            console.log(`[Row ${i + 1}] SKU: ${SKU} - Update failed: matchedCount=${result.matchedCount}, modifiedCount=${result.modifiedCount}`);
          }
        }
      } catch (rowErr) {
        const errorMsg = `Row ${i + 1} (SKU: ${row.SKU || row.sku || "N/A"}): ${rowErr.message}`;
        console.error(`[importProductsWithCategoryMatch Error] ${errorMsg}`);
        stats.errors.push({ row: i + 1, error: errorMsg, sku: row.SKU || row.sku || "N/A" });
      }
    }

    // Convert Sets to Arrays for JSON response
    const missingCategoriesList = Array.from(stats.missingCategories).sort();
    const missingSubcategoriesList = Array.from(stats.missingSubcategories).sort();

    // Build mismatch report
    const csvCategoryList = Array.from(csvCategoryNames).sort();
    const csvSubcategoryList = Array.from(csvSubcategoryNames).sort();
    const mismatchReport = {
      categories: {
        inCSV: csvCategoryList,
        inDB: dbCategoryNames,
        missing: missingCategoriesList,
        mismatches: Array.from(categoryMismatches.entries()).map(([csv, db]) => ({
          csvName: csv,
          closestDBMatch: db,
          suggestion: db !== "NO_MATCH" ? `Did you mean "${db}"?` : "No similar category found in DB"
        }))
      },
      subcategories: {
        inCSV: csvSubcategoryList,
        inDB: dbSubcategoryNames,
        missing: missingSubcategoriesList,
        mismatches: Array.from(subcategoryMismatches.entries()).map(([csv, db]) => ({
          csvName: csv,
          closestDBMatch: db,
          suggestion: db !== "NO_MATCH" ? `Did you mean "${db}"?` : "No similar subcategory found in DB"
        }))
      }
    };

    console.log(`\n[importProductsWithCategoryMatch] Summary:`);
    console.log(`- Updated: ${stats.updated} products`);
    console.log(`- Created: ${stats.created} products`);
    console.log(`- Skipped: ${stats.skipped} products`);
    console.log(`- Created: ${stats.createdCategories} categories, ${stats.createdSubcategories} subcategories`);
    console.log(`- Errors: ${stats.errors.length}`);
    console.log(`\n[importProductsWithCategoryMatch] Name Analysis:`);
    console.log(`- Unique Categories in CSV/Excel: ${csvCategoryList.length}`);
    console.log(`- Unique Subcategories in CSV/Excel: ${csvSubcategoryList.length}`);
    console.log(`- Categories in DB: ${dbCategoryNames.length}`);
    console.log(`- Subcategories in DB: ${dbSubcategoryNames.length}`);
    
    if (categoryMismatches.size > 0) {
      console.log(`\n[importProductsWithCategoryMatch] Category Name Mismatches (${categoryMismatches.size}):`);
      Array.from(categoryMismatches.entries()).slice(0, 20).forEach(([csv, db]) => {
        console.log(`  - CSV: "${csv}" -> DB: ${db === "NO_MATCH" ? "NOT FOUND" : `"${db}"`}`);
      });
      if (categoryMismatches.size > 20) {
        console.log(`  ... and ${categoryMismatches.size - 20} more mismatches`);
      }
    }
    
    if (subcategoryMismatches.size > 0) {
      console.log(`\n[importProductsWithCategoryMatch] Subcategory Name Mismatches (${subcategoryMismatches.size}):`);
      Array.from(subcategoryMismatches.entries()).slice(0, 20).forEach(([csv, db]) => {
        console.log(`  - CSV: "${csv}" -> DB: ${db === "NO_MATCH" ? "NOT FOUND" : `"${db}"`}`);
      });
      if (subcategoryMismatches.size > 20) {
        console.log(`  ... and ${subcategoryMismatches.size - 20} more mismatches`);
      }
    }
    
    if (missingCategoriesList.length > 0) {
      console.log(`\n[importProductsWithCategoryMatch] Failed to create Categories (${missingCategoriesList.length}):`, missingCategoriesList.slice(0, 20));
      if (missingCategoriesList.length > 20) {
        console.log(`  ... and ${missingCategoriesList.length - 20} more categories`);
      }
    }
    if (missingSubcategoriesList.length > 0) {
      console.log(`\n[importProductsWithCategoryMatch] Failed to create Subcategories (${missingSubcategoriesList.length}):`, missingSubcategoriesList.slice(0, 20));
      if (missingSubcategoriesList.length > 20) {
        console.log(`  ... and ${missingSubcategoriesList.length - 20} more subcategories`);
      }
    }

    const message = stats.createdCategories > 0 || stats.createdSubcategories > 0 || stats.created > 0
      ? `Updated ${stats.updated} products, created ${stats.created} new products. Created ${stats.createdCategories} new categories and ${stats.createdSubcategories} new subcategories. ${stats.skipped} products were skipped.`
      : missingCategoriesList.length > 0 || missingSubcategoriesList.length > 0
      ? `Updated ${stats.updated} products, created ${stats.created} products, skipped ${stats.skipped} products. ⚠️ ${missingCategoriesList.length} categories and ${missingSubcategoriesList.length} subcategories failed to create (check errors).`
      : `Successfully updated ${stats.updated} products, created ${stats.created} products with category/subcategory IDs. ${stats.skipped} products were skipped (already had correct IDs or no match found).`;

    return res.status(stats.errors.length ? 207 : 200).json({
      ok: stats.errors.length === 0,
      updated: stats.updated,
      created: stats.created,
      skipped: stats.skipped,
      createdCategories: stats.createdCategories,
      createdSubcategories: stats.createdSubcategories,
      errors: stats.errors,
      missingCategories: missingCategoriesList,
      missingSubcategories: missingSubcategoriesList,
      mismatchReport: mismatchReport,
      message,
      summary: {
        totalProcessed: rows.length,
        updated: stats.updated,
        created: stats.created,
        skipped: stats.skipped,
        createdCategories: stats.createdCategories,
        createdSubcategories: stats.createdSubcategories,
        errors: stats.errors.length,
        missingCategoriesCount: missingCategoriesList.length,
        missingSubcategoriesCount: missingSubcategoriesList.length,
        csvCategoryCount: csvCategoryList.length,
        csvSubcategoryCount: csvSubcategoryList.length,
        dbCategoryCount: dbCategoryNames.length,
        dbSubcategoryCount: dbSubcategoryNames.length,
      },
    });
  } catch (e) {
    console.error("importProductsWithCategoryMatch fatal:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
