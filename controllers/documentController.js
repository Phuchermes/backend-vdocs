// controllers/documentController.js
const Document = require("../models/Document");
const cloudinary = require("cloudinary").v2;

// Cloudinary config từ environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadDocument = async (req, res) => {
  try {
    if (req.user.department !== "HDCX") return res.status(403).json({ error: "Không có quyền" });
    if (!req.file) return res.status(400).json({ error: "Không có file" });

    const fileName = Date.now() + "-" + req.file.originalname.replace(/\s+/g, "_");

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", public_id: fileName },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || "",
      fileName,
      publicUrl: result.secure_url,
      department: "HDCX",
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload lỗi", details: err.message });
  }
};

/**
 * Lấy file PDF (publicUrl) — CHỈ HDCX được xem
 */
const getDocumentFile = async (req, res) => {
  try {
    if (req.user.department !== "HDCX")
      return res.status(403).json({ error: "Không quyền" });

    const doc = await Document.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ error: "Không tìm thấy tài liệu" });

    res.json({ url: doc.publicUrl });
  } catch (err) {
    console.error("Get file error:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

/**
 * Lấy danh sách tài liệu — CHỈ HDCX
 */
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

