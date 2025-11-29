// routes/documents.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware"); // bạn đã có
const {
  uploadDocument,
  getDocumentFile,
  getAllDocuments,
} = require("../controllers/documentController");

// Upload PDF
router.post("/upload", verifyToken, upload.single("file"), uploadDocument);

// Lấy danh sách PDF
router.get("/", verifyToken, getAllDocuments);

// Lấy link WebView PDF
router.get("/:id", verifyToken, getDocumentFile);

module.exports = router;
