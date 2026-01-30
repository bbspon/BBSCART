

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===== helpers =====
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const baseUploadDir = path.join(__dirname, "..", "uploads");
ensureDir(baseUploadDir);

// ========== ORIGINAL IMAGE-FIRST UPLOADER (kept as-is) ==========
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, baseUploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// default filter (images only)
const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png","image/webp",   // add this
    "image/gif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPG/PNG allowed"), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

// exports – keep these names
exports.upload = upload;

// Document upload (PAN, GST, etc.): JPG, PNG, PDF
const documentFileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPG, PNG, PDF allowed"), false);
};
const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFileFilter,
});
exports.uploadDocument = uploadDocument;

exports.uploadAny = upload.any();
exports.uploadSingle = (name) => upload.single(name);
exports.uploadFields = (fields) => upload.fields(fields);

// additional logic for handling file uploads
exports.handleFileUploads = (req) => {
  const files = Array.isArray(req.files) ? req.files : (req.files ? Object.values(req.files).flat() : []);
  const pick = (name) => Array.isArray(req.files) ? files.find(f => f.fieldname === name) : (req.files?.[name]?.[0] || null);
  const pickAll = (name) => Array.isArray(req.files) ? files.filter(f => f.fieldname === name) : (req.files?.[name] || []);

  const productFile = pick("product_img");
  const productImage = productFile ? `/uploads/${productFile.filename}` : "";
  const galleryFiles = pickAll("gallery_imgs");
  const galleryImages = galleryFiles.map(f => `/uploads/${f.filename}`);

  return {
    productImage,
    galleryImages,
    variantImages: files.reduce((acc, file) => {
      const match = file.fieldname && file.fieldname.match(/variant_img_(\d+)/);
      if (match) {
        const index = match[1];
        acc[index] = acc[index] || { variantImg: "", variantGalleryImgs: [] };
        acc[index].variantImg = `/uploads/${file.filename}`;
      }
      return acc;
    }, {}),
    variantGalleryImages: files.reduce((acc, file) => {
      const match = file.fieldname && file.fieldname.match(/variant_gallery_imgs_(\d+)/);
      if (match) {
        const index = match[1];
        acc[index] = acc[index] || { variantImg: "", variantGalleryImgs: [] };
        acc[index].variantGalleryImgs.push(`/uploads/${file.filename}`);
      }
      return acc;
    }, {}),
  };
};

// ========== NEW: DEDICATED IMAGE UPLOADER (JPG/PNG) ==========
const imagesDir = path.join(baseUploadDir, "images");
ensureDir(imagesDir);

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imagesDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const imageFileFilter = (_req, file, cb) => {
  const ok = ["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype);
  if (!ok) return cb(new Error("Invalid file type. Only JPG/PNG allowed"));
  cb(null, true);
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB for images
});

exports.uploadImage = uploadImage;

// ========== NEW: DEDICATED IMPORT UPLOADER (CSV/XLSX) ==========
const importsDir = path.join(baseUploadDir, "imports");
ensureDir(importsDir);

const importStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, importsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // .csv | .xlsx
    const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
    cb(null, `${unique}${ext}`);
  },
});

const importFileFilter = (_req, file, cb) => {
  const name = (file.originalname || "").toLowerCase();
  const type = file.mimetype || "";
  const ok =
    type === "text/csv" ||
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    name.endsWith(".csv") ||
    name.endsWith(".xlsx");
  if (!ok) return cb(new Error("Invalid file type. Only CSV/XLSX allowed"));
  cb(null, true);
};

const uploadImport = multer({
  storage: importStorage,
  fileFilter: importFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB for CSV/XLSX
});

exports.uploadImport = uploadImport;
