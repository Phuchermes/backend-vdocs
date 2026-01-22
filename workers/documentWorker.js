const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const Document = require("../models/Document");

const BASE_DIR = path.join(__dirname, "../uploads");
let mongoReady = false;

async function initDB() {
  if (mongoReady) return;
  await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 3 });
  mongoReady = true;
}

process.on("message", async (job) => {
  try {
    await initDB();

    const { tmpPath, filename, title, description, department } = job;

    const targetDir = path.join(BASE_DIR, "documents");
    await fs.promises.mkdir(targetDir, { recursive: true });

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
  } catch (err) {
    process.send({ success: false, error: err.message });
  }
});