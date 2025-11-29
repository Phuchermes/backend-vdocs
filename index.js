const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./dbsetup")

// ROUTES
const authRoutes = require("./routes/auth");
const documentsRoutes = require("./routes/documents");
const filesRoutes = require("./routes/files");

dotenv.config();

const app = express();

// ===== Global middlewares =====
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MongoDB Connect =====
connectDB();

// ===== Static Files =====
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/files", filesRoutes);

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("Server is running OK");
});


// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

