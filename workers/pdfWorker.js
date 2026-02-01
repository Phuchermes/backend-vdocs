const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const File = require("../models/File");

const { generateIrregularPDF } = require("../services/irregularPdf");
const { generateULDPDF } = require("../services/uldPdf");
const { generateKHPDF } = require("../services/khPdf");
const { generateAVIHPDF } = require("../services/avihPdf");
const { generateOffloadPDF } = require("../services/offloadPdf");
const { generateReport35PDF } = require("../services/report35Pdf");

const BASE_DIR = path.join(__dirname, "../uploads");

let mongoReady = false;

async function initDB() {
  if (mongoReady) return;
  await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 5,
  });
  mongoReady = true;
  console.log("[PDF_WORKER] Mongo connected");
}

process.on("message", async (job) => {
  try {
    await initDB();

    const { files, type, batch } = job;
    const targetDir = path.join(BASE_DIR, type, String(batch));
    await fs.promises.mkdir(targetDir, { recursive: true });

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
    
      const sig1 = files.find(f => f.originalname.startsWith("signavih1"));
      const sig2 = files.find(f => f.originalname.startsWith("signavih2"));
      const images = files.filter(f => !f.originalname.startsWith("signavih"));
    
      const pdfPath = path.join(targetDir, `${formData.trans}.pdf`);
    
      await generateAVIHPDF({
        formData,
        rows,
        images,
        signavih: { sig1, sig2 },
        outputPath: pdfPath,
      });
      console.log("FOUND SIG1:", sig1?.tmpPath);
    console.log("FOUND SIG2:", sig2?.tmpPath);
    
      const stat = await fs.promises.stat(pdfPath);
      const finalAVIHName = `${formData.trans}.pdf`;
      await File.create({
        filename: finalAVIHName,
        path: `/${type}/${batch}/${formData.trans}.pdf`,
        mimetype: "application/pdf",
        size: stat.size,
        uploadedBy: files[0].uploadedBy,
        department: files[0].department,
        targetDept: files[0].targetDept,
        batch,
      });
      const filesToUpload = files.filter(f => !f.originalname.startsWith("meta") && !f.originalname.startsWith("signavih1")&& !f.originalname.startsWith("signavih2"))
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
          console.log("ALL FILES RECEIVED:");
          files.forEach(f => console.log(" - ", f.originalname));
          console.log("formData received:", formData);
        }
    }
    
    if (type === "offload") {
      const metaFile = files.find(f => f.originalname === "meta.json");
      if (!metaFile) throw new Error("Meta file missing!");
    
      const metaContent = await fs.promises.readFile(metaFile.tmpPath, "utf-8");
      const { formData, rows } = JSON.parse(metaContent);
    
      if (!formData || !formData.location)
        throw new Error("formData.location missing!");
    
      const sig1 = files.find(f => f.originalname.startsWith("signoffload"));
      const images = files.filter(f =>
        !f.originalname.startsWith("signoffload") &&
        !f.originalname.startsWith("meta")
      );
    
      const BASE_URL = "https://backendvdocs.duckdns.org";
    
      // Map từng ảnh đúng từng row → gán vào row.qr
      for (let i = 0; i < rows.length; i++) {
        const img = images[i];
    
        if (img) {
          const pubUrl = `${BASE_URL}/uploads/${type}/${batch}/${img.filename}`;
          rows[i].qr = pubUrl;
          console.log("OFFLOAD QR:", pubUrl);
        } else {
          rows[i].qr = "";
        }
      }
    
      // DÙNG location CHO OFFLOAD
      const pdfPath = path.join(targetDir, `${formData.location}.pdf`);
    
      await generateOffloadPDF({
        formData,
        rows,
        images,
        signoffload: { sig1 },
        outputPath: pdfPath,
      });
    
      const stat = await fs.promises.stat(pdfPath);
    
      await File.create({
        filename: `${formData.location}.pdf`,
        path: `/${type}/${batch}/${formData.location}.pdf`,
        mimetype: "application/pdf",
        size: stat.size,
        uploadedBy: files[0].uploadedBy,
        department: files[0].department,
        targetDept: files[0].targetDept,
        batch,
      });
    
      // LƯU ảnh
      const filesToUpload = files.filter(
        f => !f.originalname.startsWith("meta") &&
             !f.originalname.startsWith("signoffload")
      );
    
      for (const f of filesToUpload) {
        const finalPath = path.join(targetDir, f.filename);
        await fs.promises.rename(f.tmpPath, finalPath);
    
        await File.create({
          filename: f.originalname,
          path: finalPath.replace(BASE_DIR, "").replace(/\\/g, "/"),
          mimetype: f.mimetype,
          size: f.size,
          uploadedBy: f.uploadedBy,
          department: f.department,
          targetDept: f.targetDept,
          batch,
        });
      }
    }

    if (type === "report35" ) {
          const metaFile = files.find(f => f.originalname === "meta.json");
          if (!metaFile) throw new Error("Meta file missing!");
    
          const metaContent = await fs.promises.readFile(metaFile.tmpPath, "utf-8");
          const { formData, rows } = JSON.parse(metaContent);
    
            if (!formData || Object.keys(formData).length === 0)
              throw new Error("formData empty!");
    
      const pdfPath = path.join(targetDir, `GT35-${formData.location1}-${formData.location2}-${formData.day}${formData.month}${formData.year}.pdf`);

      await generateReport35PDF({
        formData,
        rows,
        outputPath: pdfPath,
      });

    
      const stat = await fs.promises.stat(pdfPath);
      const finalReport35Name = `GT35-${formData.location1}-${formData.location2}-${formData.day}${formData.month}${formData.year}.pdf`;
      // console.log("WORKER FILE META:", files[0]);
      // console.log("UPLOADED BY:", files[0].uploadedBy);
      // console.log("CREATED BY:", files[0].createdBy);
      // console.log("JOB.DATA:", job.data);
    
      await File.create({
        filename: finalReport35Name,
        path: `/${type}/${batch}/GT35-${formData.location1}-${formData.location2}-${formData.day}${formData.month}${formData.year}.pdf`,
        mimetype: "application/pdf",
        size: stat.size,
        uploadedBy: files[0].uploadedBy,
        department: files[0].department,
        targetDept: files[0].targetDept,
        batch,
      });
      const filesToUpload = files.filter(f => !f.originalname.startsWith("meta"))
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
          console.log("ALL FILES RECEIVED:");
          files.forEach(f => console.log(" - ", f.originalname));
          console.log("formData received:", formData);
          console.log("WORKER FILE META:", files[0]);
        }
    }
    
    process.send({ success: true });
    } catch (err) {
    console.error("PDF worker error:", err);
    process.send({ success: false, error: err.message });
  }
});