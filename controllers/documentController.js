const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");

// Slugify tên file
const slugify = (text) => 
  text
    .normalize("NFD")                // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/\s+/g, "_")            // space → _
    .replace(/[^\w\-\.]+/g, "")      // chỉ bỏ ký tự lạ, **giữ .**
    .toLowerCase();
    
// Folder lưu file PDF
const baseDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

// Upload PDF
const uploadDocument = async (req, res) => {
  try {
    if (req.user.department !== "HDCX")
      return res.status(403).json({ error: "Không có quyền" });

    if (!req.file)
      return res.status(400).json({ error: "Không có file" });

    // Tạo tên file
    const fileName = `${Date.now()}-${slugify(req.file.originalname)}`;
    const filePath = path.join(baseDir, fileName);

    // Ghi buffer ra disk
    fs.writeFileSync(filePath, req.file.buffer);

    // Lưu MongoDB
    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || "",
      fileName,
      publicUrl: `/uploads/documents/${fileName}`,
      department: "HDCX",
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload lỗi", details: err.message });
  }
};

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
