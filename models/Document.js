// models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // tên tài liệu
    description: { type: String, default: "" }, // mô tả
    fileId: { type: String, required: true }, 
    fileName: { type: String, required: true },  // link file PDF (nếu có)
    department: { type: String, default: "HDCX" }, // chỉ HDCX xem
    webViewLink: { type: String, required: true },      // link xem PDF
    webContentLink: { type: String, required: true }, // nội dung metadata JSON (nếu cần)
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
