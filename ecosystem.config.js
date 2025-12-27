module.exports = {
  apps: [
    {
      name: "backendvdocs",
      script: "./index.js",
      exec_mode: "cluster",
      instances: "max",
      max_memory_restart: "300M",
      cwd: "/var/www/backend-vdocs",
      env: {
        PORT: 3000,
        MONGO_URI: "mongodb://127.0.0.1:27017/fileuploads",
        JWT_SECRET: "my_super_secret_key"
      },
    },
    {
      name: "cleanup",
      script: "worker-cleanup.js",
      exec_mode: "fork",
      cron_restart: "0 3 * * *"
    }
  ],
};