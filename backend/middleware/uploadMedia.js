// middleware/uploadMedia.js
const multer = require("multer");
const path = require("path");
const { UPLOAD_ROOT } = require("../services/mediaProcessor");
const fs = require("fs");

if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_ROOT, "tmp")),
  filename: (_req, file, cb) => {
    const base = path
      .parse(file.originalname)
      .name.replace(/[^\p{L}\p{N}\-_.]+/gu, "-")
      .slice(0, 80);
    const stamp = Date.now();
    cb(
      null,
      `${base}-${stamp}${path.extname(file.originalname).toLowerCase()}`
    );
  },
});

const uploadMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = { uploadMedia };
