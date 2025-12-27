module.exports = {
  apps: [
    {
      name: "backendvdocs",
      script: "./index.js",
      exec_mode: "cluster",
      instances: "max",
      max_memory_restart: "300M",
      autorestart: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      watch: false,

      cwd: "/var/www/backend-vdocs",
      env: {
        PORT: 3000,
        MONGO_URI: "mongodb://127.0.0.1:27017/fileuploads",
        JWT_SECRET: "my_super_secret_key"
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
  ],
};