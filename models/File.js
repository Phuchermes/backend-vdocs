const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  department: {
    type: String,
    required: true,
  },
  targetDept: String,  
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
