const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is undefined in .env");
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err);
  }
};

mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 50, // tăng để handle >100 connections
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = connectDB;