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

require("dotenv").config({ quiet: true });

const app = express();
app.get('/health', (req, res) => {
  res.status(200).send('Server is OK');
});

// ===== Global middlewares =====
app.use(cors({
  origin: [
    "https://web-v-docs.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MongoDB Connect =====
async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });

  } catch (err) {
    console.error(" Startup failed:", err);
    process.exit(1); // để PM2 restart
  }
}

start();

// ===== Static Files =====
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/files", filesRoutes);

// ===== ROOT =====
app.get("/", (req, res) => {
  res.send("Welcome to storage VIAGS");
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.keepAliveTimeout = 60000; // 60s
server.headersTimeout = 65000;

setInterval(() => {
  console.log("heartbeat", Date.now());
}, 60000);

server.listen(PORT, '::', () => {
  console.log(`Server running on port ${PORT} (IPv4 + IPv6)`);
});

process.on('uncaughtException', err => {
  console.error(err);
});

process.on('unhandledRejection', err => {
  console.error(err);
});

