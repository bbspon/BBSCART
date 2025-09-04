const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// if this is your default, keep images only here
const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
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
exports.uploadAny = upload.any();
exports.uploadSingle = (name) => upload.single(name);
exports.uploadFields = (fields) => upload.fields(fields);

// additional logic for handling file uploads
exports.handleFileUploads = (req) => {
  const files = Array.isArray(req.files) ? req.files : [];
  const pick = (name) => files.find(f => f.fieldname === name);
  const pickAll = (name) => files.filter(f => f.fieldname === name);

  const productImage = pick("product_img") ? `/uploads/${pick("product_img").filename}` : "";
  const galleryImages = pickAll("gallery_imgs").map(f => `/uploads/${f.filename}`);

  return {
    productImage,
    galleryImages,
    variantImages: files.reduce((acc, file) => {
      const match = file.fieldname.match(/variant_img_(\d+)/);
      if (match) {
        const index = match[1];
        acc[index] = acc[index] || { variantImg: "", variantGalleryImgs: [] };
        acc[index].variantImg = `/uploads/${file.filename}`;
      }
      return acc;
    }, {}),
    variantGalleryImages: files.reduce((acc, file) => {
      const match = file.fieldname.match(/variant_gallery_imgs_(\d+)/);
      if (match) {
        const index = match[1];
        acc[index] = acc[index] || { variantImg: "", variantGalleryImgs: [] };
        acc[index].variantGalleryImgs.push(`/uploads/${file.filename}`);
      }
      return acc;
    }, {}),
  };
};
