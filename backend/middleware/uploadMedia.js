// middleware/uploadMedia.js
const multer = require("multer");
const path = require("path");
const { UPLOAD_ROOT } = require("../services/mediaProcessor");
const fs = require("fs");

if (!fs.existsSync(UPLOAD_ROOT)) fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(UPLOAD_ROOT, "tmp")),
filename: (_req, file, cb) => {
  cb(null, file.originalname);
},

});

// ✅ Use .any() to accept any field name, then filter in the route
const uploadMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    // Accept all fields, we'll validate in the route
    cb(null, true);
  },
});

module.exports = { uploadMedia };
