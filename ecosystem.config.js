module.exports = {
  apps: [
    {
      name: "backendvdocs",
      script: "./index.js",
      
      exec_mode: "cluster",
      instances: "2",

      max_memory_restart: "512M",
      autorestart: true,

      listen_timeout: 30000,
      kill_timeout: 10000,

      watch: false,
      cwd: "/var/www/backend-vdocs",
      env: {
        PORT: 3000,
        MONGO_URI: "mongodb://127.0.0.1:27017/fileuploads",
        JWT_SECRET: "my_super_secret_key"
      },
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
  ],
};