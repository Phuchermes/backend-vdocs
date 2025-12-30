module.exports = {
  apps: [
    {
      name: "backendvdocs",
      script: "./index.js",
      cwd: "/var/www/backend-vdocs",
      
      exec_mode: "fork",
      instances: "1",

      max_memory_restart: "512M",
      autorestart: true,

      node_args: "--max-old-space-size=384",
      watch: false,
      
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
  ],
};