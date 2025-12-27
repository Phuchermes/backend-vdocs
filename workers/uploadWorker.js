const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const File = require("../models/File");
const BASE_DIR = path.join(__dirname, "../uploads");

process.on("message", async (job) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const { files, type, batch } = job;
    const targetDir = path.join(BASE_DIR, type, String(batch));
    fs.mkdirSync(targetDir, { recursive: true });

    for (const f of files) {
      const finalPath = path.join(targetDir, f.filename);
      fs.renameSync(f.tmpPath, finalPath);

      const relativePath = finalPath
        .replace(BASE_DIR, "")
        .replace(/\\/g, "/");

      await File.create({
        filename: f.originalname,
        path: relativePath,
        mimetype: f.mimetype,
        size: f.size,
        uploadedBy: f.uploadedBy,
        department: f.department,
        targetDept: f.targetDept,
        batch,
      });
    }

    process.send({ success: true });
    process.exit(0);
  } catch (err) {
    console.error("Worker error:", err);
    process.send({ success: false, error: err.message });
    process.exit(1);
  }
});
