const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const {
  uploadFileMiddleware,
  saveFile,
  getFiles,
} = require("../controllers/fileController");

// ===== UPLOAD FILES =====
router.post("/upload", verifyToken, uploadFileMiddleware, saveFile);

// ===== GET FILES (PHÂN QUYỀN) =====
router.get("/", verifyToken, getFiles);

module.exports = router;
