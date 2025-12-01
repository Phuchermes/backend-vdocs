// models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // tên tài liệu
    description: { type: String, default: "" }, // mô tả
    fileName: { type: String, required: true },  // link file PDF (nếu có)
    department: { type: String, default: "HDCX" }, // chỉ HDCX xem
    publicUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
