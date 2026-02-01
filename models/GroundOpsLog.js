const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  flightNo: String,
  formData: Object,
  result: Object,
  engineVersion: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GroundOpsLog", schema);