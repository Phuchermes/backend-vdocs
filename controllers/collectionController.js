const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/Document");

const baseDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);
const subFolders = ["document"];
subFolders.forEach(f => {
  const dir = path.join(baseDir, f);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type && subFolders.includes(req.query.type)
      ? req.query.type
      : "avih";
    cb(null, path.join(baseDir, type));
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  }
});

const upload = multer({ storage });
exports.uploadFileMiddleware = upload.single("file");

exports.saveFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Không có file" });
    if (!req.user) return res.status(401).json({ message: "Không có user" });

    const relativePath = req.file.path.replace(/\\/g, "/");

    const newFile = await File.create({
      filename: req.file.originalname,
      path: relativePath,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      department: req.user.department
    });

    res.json({
      success: true,
      message: "Upload thành công",
      file: newFile
    });
  } catch (err) {
    console.error("Save file error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
