const multer = require("multer");
const path = require("path");

// Upload folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/vendor-identity/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
