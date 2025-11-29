const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");

// ===== Uploads folder =====
const baseDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

const subFolders = ["avih", "irregular", "uld", "kh"];
subFolders.forEach(f => {
  const dir = path.join(baseDir, f);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// ===== Multer storage =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type && subFolders.includes(req.query.type) ? req.query.type : "avih";

    // Chỉ áp dụng folder timestamp cho irregular
    let uploadPath = path.join(baseDir, type);
    if (type === "irregular") {
      const timestamp = req.timestamp || Date.now(); // lấy từ middleware nếu có, nếu chưa thì tạo mới
      req.timestamp = timestamp; // lưu vào req để dùng chung cho tất cả file
      uploadPath = path.join(uploadPath, String(timestamp));
    }

    else if (type === "avih") {
      const timestamp = req.timestamp || Date.now(); // lấy từ middleware nếu có, nếu chưa thì tạo mới
      req.timestamp = timestamp; // lưu vào req để dùng chung cho tất cả file
      uploadPath = path.join(uploadPath, String(timestamp));
    }

    else if (type === "uld") {
      const timestamp = req.timestamp || Date.now(); // lấy từ middleware nếu có, nếu chưa thì tạo mới
      req.timestamp = timestamp; // lưu vào req để dùng chung cho tất cả file
      uploadPath = path.join(uploadPath, String(timestamp));
    }

    else if (type === "kh") {
      const timestamp = req.timestamp || Date.now(); // lấy từ middleware nếu có, nếu chưa thì tạo mới
      req.timestamp = timestamp; // lưu vào req để dùng chung cho tất cả file
      uploadPath = path.join(uploadPath, String(timestamp));
    }

    // Tạo folder nếu chưa tồn tại
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // giữ nguyên tên file + timestamp trong tên
    const safeName = `${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safeName);
  }
});

// Upload middleware (nhiều file)
const upload = multer({ storage });
exports.uploadFileMiddleware = upload.array("files");

// ===== Save file =====
exports.saveFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) 
      return res.status(400).json({ message: "Không có file" });
    if (!req.user) 
      return res.status(401).json({ message: "Không có user" });

    const savedFiles = [];
    

    let targetDept = "";

// irregular → PVHL
if (req.query.type === "irregular") {
  if (req.user.department === "HDCX") targetDept = "PVHL";
  else targetDept = "HDCX";
}

else if (req.query.type === "avih") {
  if (req.user.department === "HDCX") targetDept = "PVHL";
  else targetDept = "HDCX";
}


// uld → ULD
else if (req.query.type === "uld") {
  if (req.user.department === "HDCX") targetDept = "ULD";
  else targetDept = "HDCX";
}

// kh → KH
else if (req.query.type === "kh") {
  if (req.user.department === "HDCX") targetDept = "KH";
  else targetDept = "HDCX";
}

// fallback
else {
  targetDept = req.user.department;
}
        const batchTimeStamp = Date.now(); // <-- tạo timestamp tại server
      for (const file of req.files) {
        const relativePath = path.join(file.destination.replace(baseDir, ""), file.filename).replace(/\\/g, "/");
        const newFile = await File.create({
    filename: file.originalname,
    path: relativePath,
    mimetype: file.mimetype,
    size: file.size,
    uploadedBy: req.user._id,
    department: req.user.department,  // người upload
    targetDept,                       // ai được xem
    batch: batchTimeStamp, 
  });
  savedFiles.push(newFile);
}

    res.json({
      success: true,
      message: `Upload thành công ${savedFiles.length} file`,
      files: savedFiles
    });
  } catch (err) {
    console.error("Save file error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// ===== Get files với phân quyền =====
exports.getFiles = async (req, res) => {
  try {
    const dept = req.user.department;

    // Lọc theo targetDept
    let filter = { 
      $or: [
        { uploadedBy: req.user._id }, // luôn thấy file mình upload
        { targetDept: dept }          // thấy file gửi cho dept mình
      ]
    };

    const files = await File.find(filter).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error("Get files error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
