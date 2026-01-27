// routes/mediaRoutes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const { uploadMedia } = require("../middleware/uploadMedia");
const Media = require("../models/Media");
const {
  processImage,
  processVideo,
  toAbsUrl,
  UPLOAD_ROOT,
} = require("../services/mediaProcessor");

// POST /api/media/upload  (multiple files)
router.post("/upload", uploadMedia.array("files", 50), async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ message: "No files" });

    const out = [];
    for (const f of req.files) {
      const ext = path.extname(f.filename).toLowerCase();
      const srcPath = path.join(UPLOAD_ROOT, "tmp", f.filename);

      if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
        const baseName = `${path.parse(f.filename).name}.webp`;
        const img = await processImage(srcPath, baseName);
        fs.unlink(srcPath, () => {});
        const doc = await Media.create({
          filename: img.main.filename,
          type: "image",
          status: "ready",
          storageProvider: "local",
          folder: "",
          url: img.main.url,
          size: img.main.size,
          mime: img.main.mime,
          width: img.main.width,
          height: img.main.height,
          variants: [
            { label: "webp", ...img.main },
            { label: "thumb", ...img.thumb },
          ],
          tags: [],
          uploadedBy: null,
          uploaderRole: "staff",
          accessLevel: "public",
          linkedProducts: [],
          linkedCategories: [],
          linkedCollections: [],
          referenceCount: 0,
          deleted: false,
        });
        out.push(doc);
      } else if ([".mp4", ".mov", ".mkv", ".webm"].includes(ext)) {
        const videoBase = `${path.parse(f.filename).name}${ext}`;
        const vid = await processVideo(srcPath, videoBase);
        fs.unlink(srcPath, () => {});
        const variants = [{ label: "webm", ...vid.webm }];
        if (vid.poster) variants.push({ label: "poster", ...vid.poster });

        const doc = await Media.create({
          filename: path.basename(vid.webm.url),
          type: "video",
          status: "ready",
          storageProvider: "local",
          folder: "",
          url: vid.webm.url,
          size: vid.webm.size,
          mime: "video/webm",
          width: 0,
          height: 0,
          variants,
          tags: [],
          uploadedBy: null,
          uploaderRole: "staff",
          accessLevel: "public",
          linkedProducts: [],
          linkedCategories: [],
          linkedCollections: [],
          referenceCount: 0,
          deleted: false,
        });
        out.push(doc);
      } else {
        fs.unlink(srcPath, () => {});
      }
    }
    res.status(200).json({ ok: true, items: out });
  } catch (e) {
    console.error("media upload error", e);
    res.status(500).json({ ok: false, message: e.message });
  }
});

// GET /api/media — supports page, limit, total, type, q (search filename/tags)
router.get("/", async (req, res) => {
  const { type, q, page = 1, limit: rawLimit = 40 } = req.query;
  const filter = { deleted: false };
  if (type) filter.type = type;
  if (q)
    filter.$or = [
      { filename: new RegExp(q, "i") },
      { tags: new RegExp(q, "i") },
    ];
  const limit = Math.min(Math.max(1, parseInt(rawLimit, 10) || 40), 200);
  const skip = Math.max(0, (parseInt(page, 10) || 1) - 1) * limit;

  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);
  res.json({ ok: true, items, total });
});

// PUT /api/media/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { filename, tags } = req.body;
  const update = {};
  if (filename) update.filename = String(filename).trim();
  if (Array.isArray(tags)) update.tags = tags.map(String);
  const doc = await Media.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  ).lean();
  res.json({ ok: true, item: doc });
});

// DELETE /api/media/:id  (soft delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Media.findByIdAndUpdate(id, { $set: { deleted: true } });
  res.json({ ok: true });
});

module.exports = router;
