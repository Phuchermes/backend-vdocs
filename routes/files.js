const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const pdf = require("pdf-parse"); // CHỈ 1 DÒNG NÀY

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

router.get("/text", async (req, res) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.json({ error: "Missing filePath" });
    }

    const cleanPath = filePath.replace(/^\/+/, "");
    const fullPath = path.resolve("uploads", cleanPath);

    if (!fs.existsSync(fullPath)) {
      return res.json({ error: "File not found" });
    }

    const buffer = fs.readFileSync(fullPath);

    // bản 1.x dùng như này
    const data = await pdf(buffer);

    res.json({ text: data.text || "" });

  } catch (err) {
    console.error("PDF parse error:", err);
    res.json({ error: err.message });
  }
});

router.get("/download/:id", verifyToken, downloadFile);
router.delete("/:id", verifyToken, deleteFile);
router.delete("/batch/:batch", verifyToken, deleteBatch);
router.get("/batch/:batch", verifyToken, getFilesByBatch);
router.get("/restore", verifyToken, listDeletedBatches);
router.post("/restore/:batch", verifyToken, restoreBatch);
router.delete("/hard/:batch", verifyToken, hardDeleteBatch);

module.exports = router;
