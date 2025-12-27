// routes/documents.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getDocumentFile,
  getDocumentInfo,
} = require("../controllers/documentController");

// Upload / replace document
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadDocument
);

// Lấy metadata document (title, updatedAt...)
router.get("/", verifyToken, getDocumentInfo);

// Xem PDF (WebView)
router.get("/file", verifyToken, getDocumentFile);

module.exports = router;
