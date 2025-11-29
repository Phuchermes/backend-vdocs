const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // 5 chữ số tự nhập
      match: [/^\d{5}$/, 'UserId phải gồm 5 chữ số'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    deptname: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: ["KH", "PVHL", "HDCX", "PVHK", "ULD"],
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


module.exports = mongoose.model("User", userSchema);
