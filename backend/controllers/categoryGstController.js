const Category = require("../models/Category"); // adjust path/name to your project
const XLSX = require("xlsx");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

exports.uploadMiddleware = upload.single("file");

exports.bulkUploadFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log("Total Excel rows:", rows.length);

    let updatedCount = 0;
    let notMatched = [];

    for (const raw of rows) {
      // 🔹 Normalize column headers to lowercase
      const row = {};
      Object.keys(raw).forEach((key) => {
        row[key.toLowerCase().trim()] = raw[key];
      });

      const slug = String(row.slug || "").trim();
      const categoryId = String(row.categoryid || "").trim();
      const mongoId = String(row.mongoid || "").trim();
      const name = String(
        row.name ||
        row.category ||
        row["category name"] ||
        ""
      ).trim();

      const gstRate = Number(
        row.gstrate ||
        row.gst ||
        row["gst %"] ||
        0
      );

      const hsnCode = String(
        row.hsncode ||
        row.hsn ||
        row["hsn code"] ||
        ""
      ).trim();

      const isTaxInclusive =
        String(
          row.istaxinclusive ||
          row.inclusive ||
          ""
        ).toLowerCase() === "true" ||
        String(row.inclusive).toLowerCase() === "yes";

      let query = null;

      if (slug) query = { slug };
      else if (categoryId) query = { categoryId };
      else if (mongoId) query = { _id: mongoId };
      else if (name)
        query = { name: { $regex: `^${name}$`, $options: "i" } };

      if (!query) {
        notMatched.push("No identifier in row");
        continue;
      }

      const result = await Category.updateOne(
        query,
        {
          $set: {
            gstRate,
            hsnCode,
            isTaxInclusive,
          },
        }
      );

      if (result.matchedCount > 0) {
        updatedCount++;
      } else {
        notMatched.push(name || slug || categoryId || mongoId);
      }
    }

    return res.json({
      ok: true,
      message: "Bulk GST update completed",
      updatedCount,
      notMatched,
    });
  } catch (e) {
    console.error("Bulk GST Error:", e);
    return res.status(500).json({ ok: false, message: "Excel processing error" });
  }
};
exports.listCategoryGst = async (req, res) => {
  try {
    const categories = await Category.find({})
      .select("name gstRate hsnCode isTaxInclusive")
      .sort({ name: 1 });

    return res.json({ ok: true, data: categories });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

exports.updateCategoryGst = async (req, res) => {
  try {
    const { id } = req.params;
    const { gstRate, hsnCode, isTaxInclusive } = req.body;

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        gstRate: Number(gstRate || 0),
        hsnCode: (hsnCode || "").trim(),
        isTaxInclusive: Boolean(isTaxInclusive),
      },
      { new: true }
    ).select("name gstRate hsnCode isTaxInclusive");

    return res.json({ ok: true, data: updated });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

exports.bulkUpdateCategoryGst = async (req, res) => {
  try {
    // payload: [{categoryId, gstRate, hsnCode, isTaxInclusive}, ...]
    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    if (!items.length) {
      return res.status(400).json({ ok: false, message: "No items provided" });
    }

    const ops = items.map((x) => ({
      updateOne: {
        filter: { _id: x.categoryId },
        update: {
          $set: {
            gstRate: Number(x.gstRate || 0),
            hsnCode: (x.hsnCode || "").trim(),
            isTaxInclusive: Boolean(x.isTaxInclusive),
          },
        },
      },
    }));

    await Category.bulkWrite(ops);
    return res.json({ ok: true, message: "Bulk GST updated" });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};