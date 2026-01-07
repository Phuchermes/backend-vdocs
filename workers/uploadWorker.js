const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const File = require("../models/File");
const Document = require("../models/Document");
const { generateIrregularPDF } = require("../services/irregularPdf");
const { generateULDPDF } = require("../services/uldPdf");
const { generateKHPDF } = require("../services/khPdf");

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

    if (type === "irregular" ) {
      const metaFile = files.find(f => f.originalname === "meta.json");
      if (!metaFile) throw new Error("Meta file missing!");

      const metaContent = await fs.promises.readFile(metaFile.tmpPath, "utf-8");
      const { formData, checkboxes } = JSON.parse(metaContent);

        if (!formData || Object.keys(formData).length === 0)
          throw new Error("formData empty!");

  const sig1 = files.find(f => f.originalname.startsWith("__signature1"));
  const sig2 = files.find(f => f.originalname.startsWith("__signature2"));
  const images = files.filter(f => !f.originalname.startsWith("__signature"));

  const pdfPath = path.join(targetDir, `${formData.location}.pdf`);

  await generateIrregularPDF({
    formData,
    checkboxes,
    images,
    signatures: { sig1, sig2 },
    outputPath: pdfPath,
  });

  const stat = await fs.promises.stat(pdfPath);
  const finalIrregularName = `${formData.location}.pdf`;
  await File.create({
    filename: finalIrregularName,
    path: `/${type}/${batch}/${formData.location}.pdf`,
    mimetype: "application/pdf",
    size: stat.size,
    uploadedBy: files[0].uploadedBy,
    department: files[0].department,
    targetDept: files[0].targetDept,
    batch,
  });
  const filesToUpload = files.filter(f => !f.originalname.startsWith("meta") && !f.originalname.startsWith("__signature1")&& !f.originalname.startsWith("__signature2"))
      for (const f of filesToUpload) {
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
      console.log("formData.name1:", JSON.stringify(formData.name1));
      console.log("formData received:", formData);
    }
}

if (type === "uld" ) {
      const metaFile = files.find(f => f.originalname === "meta.json");
      if (!metaFile) throw new Error("Meta file missing!");

      const metaContent = await fs.promises.readFile(metaFile.tmpPath, "utf-8");
      const { formData, checkboxes } = JSON.parse(metaContent);

        if (!formData || Object.keys(formData).length === 0)
          throw new Error("formData empty!");

  const sig1 = files.find(f => f.originalname.startsWith("__signature1"));
  const sig2 = files.find(f => f.originalname.startsWith("__signature2"));
  const images = files.filter(f => !f.originalname.startsWith("__signature"));

  const pdfPath = path.join(targetDir, `${formData.location}.pdf`);

  await generateULDPDF({
    formData,
    checkboxes,
    images,
    signatures: { sig1, sig2 },
    outputPath: pdfPath,
  });

  const stat = await fs.promises.stat(pdfPath);
  const finalULDName = `${formData.location}.pdf`;
  await File.create({
    filename: finalULDName,
    path: `/${type}/${batch}/${formData.location}.pdf`,
    mimetype: "application/pdf",
    size: stat.size,
    uploadedBy: files[0].uploadedBy,
    department: files[0].department,
    targetDept: files[0].targetDept,
    batch,
  });
  const filesToUpload = files.filter(f => !f.originalname.startsWith("meta") && !f.originalname.startsWith("__signature1")&& !f.originalname.startsWith("__signature2"))
      for (const f of filesToUpload) {
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
      console.log("formData.name1:", JSON.stringify(formData.name1));
      console.log("formData received:", formData);
    }
}

if (type === "kh" ) {
      const metaFile = files.find(f => f.originalname === "meta.json");
      if (!metaFile) throw new Error("Meta file missing!");

      const metaContent = await fs.promises.readFile(metaFile.tmpPath, "utf-8");
      const { formData, checkboxes } = JSON.parse(metaContent);

        if (!formData || Object.keys(formData).length === 0)
          throw new Error("formData empty!");

  const sig1 = files.find(f => f.originalname.startsWith("__signature1"));
  const sig2 = files.find(f => f.originalname.startsWith("__signature2"));
  const images = files.filter(f => !f.originalname.startsWith("__signature"));

  const pdfPath = path.join(targetDir, `${formData.location}.pdf`);

  await generateKHPDF({
    formData,
    checkboxes,
    images,
    signatures: { sig1, sig2 },
    outputPath: pdfPath,
  });

  const stat = await fs.promises.stat(pdfPath);
  const finalKHName = `${formData.location}.pdf`;
  await File.create({
    filename: finalKHName,
    path: `/${type}/${batch}/${formData.location}.pdf`,
    mimetype: "application/pdf",
    size: stat.size,
    uploadedBy: files[0].uploadedBy,
    department: files[0].department,
    targetDept: files[0].targetDept,
    batch,
  });
  const filesToUpload = files.filter(f => !f.originalname.startsWith("meta") && !f.originalname.startsWith("__signature1")&& !f.originalname.startsWith("__signature2"))
      for (const f of filesToUpload) {
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
      console.log("formData.name1:", JSON.stringify(formData.name1));
      console.log("formData received:", formData);
    }
}

if (type === "avih" ) {
      const metaFile = files.find(f => f.originalname === "meta.json");
      if (!metaFile) throw new Error("Meta file missing!");

      const metaContent = await fs.promises.readFile(metaFile.tmpPath, "utf-8");
      const { formData, rows } = JSON.parse(metaContent);

        if (!formData || Object.keys(formData).length === 0)
          throw new Error("formData empty!");

  const sig1 = files.find(f => f.originalname.startsWith("__signavih1"));
  const sig2 = files.find(f => f.originalname.startsWith("__signavih2"));
  const images = files.filter(f => !f.originalname.startsWith("__signavih"));

  const pdfPath = path.join(targetDir, `${formData.location}.pdf`);

  await generateAVIHPDF({
    formData,
    rows,
    images,
    signatures: { sig1, sig2 },
    outputPath: pdfPath,
  });

  const stat = await fs.promises.stat(pdfPath);
  const finalAVIHName = `${formData.location}.pdf`;
  await File.create({
    filename: finalAVIHName,
    path: `/${type}/${batch}/${formData.location}.pdf`,
    mimetype: "application/pdf",
    size: stat.size,
    uploadedBy: files[0].uploadedBy,
    department: files[0].department,
    targetDept: files[0].targetDept,
    batch,
  });
  const filesToUpload = files.filter(f => !f.originalname.startsWith("meta") && !f.originalname.startsWith("__signature1")&& !f.originalname.startsWith("__signature2"))
      for (const f of filesToUpload) {
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
      console.log("formData.name1:", JSON.stringify(formData.name1));
      console.log("formData received:", formData);
    }
}

    process.send({ success: true });
    process.exit(0);
  } catch (err) {
    console.error("Worker error:", err);
    process.send({ success: false, error: err.message });
    process.exit(1);
  }
});
