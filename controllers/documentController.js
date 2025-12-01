// controllers/documentController.js
const { Readable } = require("stream");
const drive = require("../config/googleDrive");
const Document = require("../models/Document");

// CHỈ folderId, KHÔNG để nguyên URL Google Drive
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Upload PDF lên Google Drive và lưu metadata
 */
exports.uploadDocument = async (req, res) => {
  try {
    // CHỈ HDCX được upload
    if (req.user.department !== "HDCX")
      return res.status(403).json({ error: "Không có quyền" });

    if (!req.file) return res.status(400).json({ error: "Không có file" });

    const fileName = Date.now() + "-" + req.file.originalname.replace(/\s+/g, "_");

    // Tạo stream từ buffer
    const stream = Readable.from(req.file.buffer);

    // Upload lên Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [DRIVE_FOLDER_ID], // ĐÃ FIX: chỉ folderId
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
    });

    // Lưu metadata MongoDB
    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || "",
      fileId: response.data.id,
      fileName,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      department: "HDCX", // CHỈ HDCX xem được
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    console.error("Upload error:", err.response?.data || err);
    res.status(500).json({ error: "Upload lỗi", details: err.message });
  }
};

/**
 * Lấy file PDF (webViewLink) — CHỈ HDCX được xem
 */
exports.getDocumentFile = async (req, res) => {
  try {
    if (req.user.department !== "HDCX")
      return res.status(403).json({ error: "Không quyền" });

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Không tìm thấy tài liệu" });

    res.json({ url: doc.webViewLink });
  } catch (err) {
    console.error("Get file error:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

/**
 * Lấy danh sách tài liệu — CHỈ HDCX
 */
exports.getAllDocuments = async (req, res) => {
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
