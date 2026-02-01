const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const {
  uploadFileMiddleware,
  saveFile,
  getFiles,
  downloadFile,
  deleteFile,
  getFilesByBatch,
  deleteBatch,
  listDeletedBatches,
  restoreBatch,
  hardDeleteBatch
} = require("../controllers/fileController");

// ===== UPLOAD FILES =====
router.post("/upload", verifyToken, uploadFileMiddleware, saveFile);

// ===== GET FILES (PHÂN QUYỀN) =====
router.get("/", verifyToken, getFiles);

router.get("/download/:id", verifyToken, downloadFile);
router.delete("/:id", verifyToken, deleteFile);
router.delete("/batch/:batch", verifyToken, deleteBatch);
router.get("/batch/:batch", verifyToken, getFilesByBatch);
router.get("/restore", verifyToken, listDeletedBatches);
router.post("/restore/:batch", verifyToken, restoreBatch);
router.delete("/hard/:batch", verifyToken, hardDeleteBatch);

module.exports = router;
