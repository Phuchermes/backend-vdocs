module.exports = {
  apps: [
    {
      name: "backendvdocs",
      script: "./index.js",
      cwd: "/var/www/backend-vdocs",
      
      exec_mode: "cluster",
      instances: "2",

      max_memory_restart: "512M",
      autorestart: true,

      listen_timeout: 8000,
      kill_timeout: 10000,

      watch: false,
      node_args: "--max-old-space-size=384",
      
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
  ],
};