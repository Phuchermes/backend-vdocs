const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadDocument, getDocumentFile } = require("../controllers/documentController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/upload", verifyToken, upload.single("file"), uploadDocument);
router.get("/:id", verifyToken, getDocumentFile);

module.exports = router;