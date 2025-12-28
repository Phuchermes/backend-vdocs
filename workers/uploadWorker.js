const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const File = require("../models/File");
const Document = require("../models/Document");

const BASE_DIR = path.join(__dirname, "../uploads");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

process.on("message", async (job) => {
  try {
    // connect DB 1 lần
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 3,
    });

    /* ======================================================
       =============== DOCUMENT UPLOAD =====================
       ====================================================== */
    if (job.type === "document") {
      const { tmpPath, filename, title, description, department } = job;

      const targetDir = path.join(BASE_DIR, "documents");
      await ensureDir(targetDir);

      const finalPath = path.join(targetDir, filename);
      await fs.promises.rename(tmpPath, finalPath);

      await Document.create({
        title,
        description,
        fileName: filename,
        publicUrl: `/uploads/documents/${filename}`,
        department,
      });

      process.send({ success: true });
      process.exit(0);
    }

    /* ======================================================
       ================= FILES UPLOAD ======================
       ====================================================== */
    const { files, type, batch } = job;

    const targetDir = path.join(BASE_DIR, type, String(batch));
    await ensureDir(targetDir);

    for (const f of files) {
      const finalPath = path.join(targetDir, f.filename);
      await fs.promises.rename(f.tmpPath, finalPath);

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
