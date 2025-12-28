const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TMP_DIR = path.join(__dirname, "../uploads/tmp");

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TMP_DIR);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w\-\.]/g, "")
      .toLowerCase();

    cb(null, `${Date.now()}-${safe}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Chỉ PDF"), false);
    }
    cb(null, true);
  },
});
