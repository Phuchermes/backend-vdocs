const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const {
  uploadFileMiddleware,
  saveFile,
  getFiles,
  downloadFile,
  deleteFile,
  getFilesByBatch
} = require("../controllers/fileController");

// ===== UPLOAD FILES =====
router.post("/upload", verifyToken, uploadFileMiddleware, saveFile);

// ===== GET FILES (PHÂN QUYỀN) =====
router.get("/", verifyToken, getFiles);

router.get("/download/:id", verifyToken, downloadFile);
router.delete("/:id", verifyToken, deleteFile);
router.get("/batch/:batch", verifyToken, getFilesByBatch);

module.exports = router;
