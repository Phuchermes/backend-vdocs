const multer = require("multer");

// Lưu file vào memory (buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Chỉ được upload PDF"), false);
    }
    cb(null, true);
  },
});

module.exports = upload; // export trực tiếp multer instance
