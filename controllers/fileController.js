const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");
const { runUploadWorker } = require("../services/uploadQueue");

// ===== CONSTANTS =====
const BASE_DIR = path.join(__dirname, "../uploads");
const SUB_FOLDERS = ["avih", "irregular", "uld", "kh", "offload", "report35"];

// ===== INIT BASE FOLDERS (STARTUP ONLY) =====
if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR);

for (const f of SUB_FOLDERS) {
  const dir = path.join(BASE_DIR, f);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

// ===== VALIDATE TYPE (DÙNG TRƯỚC MULTER) =====
exports.validateUploadType = (req, res, next) => {
  const { type } = req.query;
  if (!SUB_FOLDERS.includes(type)) {
    return res.status(400).json({ message: "Invalid upload type" });
  }
  next();
};

// ===== MULTER STORAGE =====
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      if (!req.uploadBatch) req.uploadBatch = Date.now();

      const uploadPath = path.join(
        BASE_DIR,
        req.query.type,
        String(req.uploadBatch)
      );

      await fs.promises.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, "");

    cb(null, `${base}_${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB / file
  },
});

exports.uploadFileMiddleware = upload.array("files");

// ===== SAVE FILE =====
exports.saveFile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Không có file" });
    }

    const type = req.query.type;
    const userDept = req.user.department;


    // ===== TARGET DEPT LOGIC (GIỮ NGUYÊN NGHIỆP VỤ) =====
    let targetDept = userDept;

    if (type === "irregular" || type === "avih" || type ==="offload") {
      targetDept = userDept === "HDCX" ? "PVHL" : "HDCX";
    } else if (type === "uld") {
      targetDept = userDept === "HDCX" ? "ULD" : "HDCX";
    } else if (type === "kh") {
      targetDept = userDept === "HDCX" ? "KH" : "HDCX";
    }
    else if (type === "report35") {
      targetDept = userDept === "HDCX" ? "HDCX" : "HDCX";
    }
    

    const batch = String(req.uploadBatch || Date.now());
    const savedFiles = [];

      const files = req.files.map(file => ({
      tmpPath: file.path,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      targetDept,
      department: userDept,
      uploadedBy: req.user.id,
      batch,
    }));
//     console.log("REQ USER:", req.user);
// console.log("UPLOADED BY:", req.user.id);

/* ===== CHUẨN HÓA DATA GỬI WORKER ===== */


    let meta;

if (type === "irregular") {
  meta = {
    formData: req.body.formData,
    checkboxes: req.body.checkboxes,
  };
}

if (type === "avih") {
  meta = {
    formData: req.body.formData,
    rows: req.body.rows,
  };
}

if (type === "offload") {
  meta = {
    formData: req.body.formData,
    rows: req.body.rows,
  };
}

if (type === "report35") {
  meta = {
    formData: req.body.formData,
    rows: req.body.rows,
  };
}


if (type === "uld") {
  meta = {
    formData: req.body.formData,
    checkboxes: req.body.checkboxes,
  };
}

if (type === "kh") {
  meta = {
    formData: req.body.formData,
    checkboxes: req.body.checkboxes,
  };
}

    // GỬI JOB – KHÔNG BLOCK
    await runUploadWorker({
      files,
      type,
      department: req.user.department,
      batch,
      meta, 
    }).catch(err => {
      console.error("Worker upload failed:", err);
    });

    // TRẢ SỚM
    res.json({
      success: true,
      message: `Đã nhận ${files.length} file, đang xử lý`,
      batch,
    });

  } catch (err) {
    console.error("Save file error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ===== GET FILES (PHÂN QUYỀN) =====
exports.getFiles = async (req, res) => {
  try {
    const dept = req.user.department;

    const files = await File.find({
      deletedAt: null,
      $or: [
        { uploadedBy: req.user.id },
        { targetDept: dept },
        { department: dept }
      ],
    }).sort({ createdAt: -1 });

    res.json(files);
  } catch (err) {
    console.error("Get files error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const fileDoc = await File.findById(req.params.id);
    if (!fileDoc) return res.status(404).json({ message: "File not found" });

    const dept = req.user.department;

    // phân quyền
    if (
      fileDoc.uploadedBy.toString() !== req.user.id.toString() &&
      fileDoc.targetDept !== dept
    ) {
      return res.status(403).json({ message: "No permission" });
    }

    const absPath = path.join(BASE_DIR, fileDoc.path);

    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: "File missing on disk" });
    }

    res.download(absPath, fileDoc.filename);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFilesByBatch = async (req, res) => {
  try {
    const { batch } = req.params;
    const dept = req.user.department;

    const files = await File.find({
      batch,
      $or: [
        { uploadedBy: req.user.id },
        { targetDept: dept },
        { department: dept },
      ],
    }).sort({ createdAt: 1 });

    res.json(files);
  } catch (err) {
    console.error("Get batch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ msg: "File not found" });

    if (file.uploadedBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "No permission" });

    await File.deleteOne({ _id: file._id });

    res.json({ ok: true, msg: "Deleted from Mongo only" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ msg: "Delete failed" });
  }
};

exports.deleteBatch = async (req, res) => {
  const { batch } = req.params;

  await File.updateMany(
    {
      $or: [
        { batch: String(batch) },
        { path: new RegExp(`/${batch}/`, "g") }
      ]
    },
    { deletedAt: new Date() }
  );

  res.json({ ok: true, msg: "Batch soft deleted" });
};

exports.listDeletedBatches = async (req, res) => {
  const batches = await File.aggregate([
    { $match: { deletedAt: { $ne: null } } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
    { $project: { batch: "$_id", count: 1, _id: 0 } },
  ]);

  res.json(batches);
};

exports.restoreBatch = async (req, res) => {
  const { batch } = req.params;

  await File.updateMany(
    {
      $or: [
        { batch: String(batch) },
        { path: new RegExp(`/${batch}/`) }
      ],
      deletedAt: { $ne: null }
    },
    { $unset: { deletedAt: "" } }
  );

  res.json({ ok: true, msg: "Batch restored" });
};

exports.hardDeleteBatch = async (req, res) => {
  const { batch } = req.params;

  const result = await File.deleteMany({
    $or: [
      { batch: String(batch) },
      { batch: Number(batch) },
      { path: new RegExp(`/${batch}/`) },
    ],
  });

  res.json({
    ok: true,
    deleted: result.deletedCount,
    msg: "DB records permanently removed, disk untouched",
  });
};