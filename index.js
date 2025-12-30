// index.js
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const connectDB = require("./dbsetup");

// routes
const authRoutes = require("./routes/auth");
const documentsRoutes = require("./routes/documents");
const filesRoutes = require("./routes/files");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===== Trust proxy (Nginx) ===== */
app.set("trust proxy", true);

/* ===== Health ===== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage().rss
  });
});

/* ===== Middlewares ===== */
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ===== Static uploads (LOCAL DISK) ===== */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
    etag: false
  })
);

/* ===== Routes ===== */
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/files", filesRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to storage VIAGS");
});

/* ===== Server ===== */
const server = http.createServer(app);
server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;
server.requestTimeout = 60000;

/* ===== Start ===== */
(async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server listening on ${PORT} | PID ${process.pid}`
      );
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();

/* ===== Crash handling ===== */
process.on("unhandledRejection", err => {
  console.error("UnhandledRejection:", err);
  process.exit(1);
});

process.on("uncaughtException", err => {
  console.error("UncaughtException:", err);
  process.exit(1); // PM2 restart
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  server.close(() => process.exit(0));
});
