const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");
const { runUploadWorker } = require("../services/uploadQueue");

// Folder lưu file PDF
const baseDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

// Upload PDF
const uploadDocument = async (req, res) => {
  try {
    if (req.user.department !== "HDCX") {
      return res.status(403).json({ error: "Không có quyền" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Không có file" });
    }

    // ĐẨY JOB – KHÔNG BLOCK
    runUploadWorker({
      type: "document",
      tmpPath: req.file.path,
      filename: req.file.filename,
      title: req.body.title || req.file.originalname,
      description: req.body.description || "",
      department: "HDCX",
    }).catch(err => {
      console.error("Document worker failed:", err);
    });

    // TRẢ NGAY
    res.json({
      success: true,
      message: "Đã nhận tài liệu, đang xử lý",
    });
  } catch (err) {
    console.error("Upload document error:", err);
    res.status(500).json({ error: "Upload lỗi" });
  }
};

module.exports = { uploadDocument };

// Lấy file PDF
const getDocumentFile = async (req, res) => {
  try {
    if (req.user.department !== "HDCX")
      return res.status(403).json({ error: "Không quyền" });

   const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).send("Không tìm thấy tài liệu");

    const filePath = path.join(__dirname, "../uploads/documents", doc.fileName);
    if (!fs.existsSync(filePath)) return res.status(404).send("File không tồn tại");

    // Trả file PDF trực tiếp với MIME type
    res.setHeader("Content-Type", "application/pdf");
    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
};

// Lấy danh sách tài liệu
const getAllDocuments = async (req, res) => {
  try {
    if (req.user.department !== "HDCX")
      return res.status(403).json({ error: "Không có quyền" });

    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("Get all documents error:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { uploadDocument, getDocumentFile, getAllDocuments };
