// controllers/documentController.js
const { Readable } = require("stream");
const drive = require("../config/googleDrive");
const Document = require("../models/Document");

// Thay bằng Folder ID Google Drive của bạn
const DRIVE_FOLDER_ID = "https://drive.google.com/drive/folders/1oIfxwzlKI0DRpwJIZSY6uLVCWpfsmaeB";

/**
 * Upload PDF lên Google Drive và lưu metadata MongoDB
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (req.user.department !== "HDCX")
      return res.status(403).json({ error: "Không có quyền" });

    if (!req.file) return res.status(400).json({ error: "Không có file" });

    const fileName = Date.now() + "-" + req.file.originalname.replace(/\s+/g, "_");

    // Chuyển buffer thành stream
    const stream = Readable.from(req.file.buffer);

    // Upload lên Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: "application/pdf",
        parents: [DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: "application/pdf",
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
    });

    // Lưu metadata vào MongoDB
    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || "",
      fileId: response.data.id,
      fileName,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      department: "HDCX",
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload lỗi" });
  }
};

/**
 * Lấy link WebView PDF cho React Native
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
 * Lấy danh sách tất cả tài liệu
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
