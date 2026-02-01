const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  batch: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  department: {
    type: String,
    required: true,
  },
  targetDept: String,  
  deletedAt: Date,
}, { timestamps: true });

fileSchema.pre("save", function(next) {
  if (!this.batch && this.path) {
    const parts = this.path.split("/");
    // uploads/type/batch/filename
    if (parts.length >= 3) {
      this.batch = parts[2]; 
    }
  }
  next();
});

fileSchema.index({ batch: 1 });
fileSchema.index({ deletedAt: 1 });


module.exports = mongoose.model("File", fileSchema);
