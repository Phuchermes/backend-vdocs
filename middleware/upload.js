// middlewares/upload.js
import multer from "multer";

// Lưu file vào memory (buffer), không lưu tạm trên disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // max 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Chỉ được upload PDF"), false);
    }
    cb(null, true);
  },
});
