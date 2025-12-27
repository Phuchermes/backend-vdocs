const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Document = require("../models/Document");

// ===== Utils =====
const slugify = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w\-]+/g, "")
    .toLowerCase();

// ===== Paths =====
const DOC_DIR = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(DOC_DIR)) fs.mkdirSync(DOC_DIR, { recursive: true });

// ===== Multer (disk storage) =====
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.promises.mkdir(DOC_DIR, { recursive: true });
      cb(null, DOC_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = slugify(path.basename(file.originalname, ext));
    cb(null, `document_${Date.now()}_${base}${ext}`);
  },
});

exports.uploadDocumentMiddleware = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Chỉ cho phép PDF"));
    }
    cb(null, true);
  },
}).single("file");

// ===== Upload / Replace document =====
exports.uploadDocument = async (req, res) => {
  try {
    if (req.user.department !== "HDCX") {
      return res.status(403).json({ error: "Không có quyền" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Không có file" });
    }

    // ===== XÓA DOCUMENT CŨ (DB + FILE) =====
    const oldDoc = await Document.findOne({});
    if (oldDoc) {
      const oldPath = path.join(DOC_DIR, oldDoc.fileName);
      if (fs.existsSync(oldPath)) {
        await fs.promises.unlink(oldPath);
      }
      await oldDoc.deleteOne();
    }

    // ===== LƯU DOCUMENT MỚI =====
    const doc = await Document.create({
      title: req.body.title || "Tài liệu hiện hành",
      description: req.body.description || "",
      fileName: req.file.filename,
      department: "HDCX",
    });

    res.json({
      success: true,
      message: "Upload tài liệu thành công",
      document: doc,
    });
  } catch (err) {
    console.error("Upload document error:", err);
    res.status(500).json({ error: "Upload lỗi" });
  }
};

// ===== Get document file (view / download) =====
exports.getDocumentFile = async (req, res) => {
  try {
    if (req.user.department !== "HDCX") {
      return res.status(403).json({ error: "Không có quyền" });
    }

    const doc = await Document.findOne({});
    if (!doc) {
      return res.status(404).json({ error: "Chưa có tài liệu" });
    }

    const filePath = path.join(DOC_DIR, doc.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File không tồn tại" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${doc.fileName}"`
    );

    res.sendFile(filePath);
  } catch (err) {
    console.error("Get document error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Get document metadata =====
exports.getDocumentInfo = async (req, res) => {
  try {
    if (req.user.department !== "HDCX") {
      return res.status(403).json({ error: "Không có quyền" });
    }

    const doc = await Document.findOne({});
    res.json(doc);
  } catch (err) {
    console.error("Get document info error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
