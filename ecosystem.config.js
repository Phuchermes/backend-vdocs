module.exports = {
  apps: [
    {
      name: "vdocs-server",
      script: "./index.js",
      cwd: "/var/www/backend-vdocs",
      
      exec_mode: "cluster",
      instances: "2",

      max_memory_restart: "512M",
      autorestart: true,
      kill_timeout: 8000,
      listen_timeout: 5000,
      restart_delay: 2000,

      node_args: "--max-old-space-size=384",

      watch: false,

      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/vdocs-server/error.log",
      out_file: "/var/log/vdocs-server/out.log",

      min_uptime: "30s",
      max_restarts: 5,

      env: {
        NODE_ENV: "production",
        PORT: 3000
      },

      shutdown_with_message: true,

      time: true
    },
     // ===== DISPATCHER =====
    {
      name: "vdocs-server-dispatcher",
      script: "./workers/uploadDispatcher.js",
      cwd: "/var/www/backend-vdocs",
      exec_mode: "fork",
      instances: 1
    },

    // ===== PDF WORKER =====
    {
      name: "vdocs-server-pdf-worker",
      script: "./workers/pdfWorker.js",
      cwd: "/var/www/backend-vdocs",
      exec_mode: "fork",
      instances: 2
    },

    // ===== DOCUMENT WORKER =====
    {
      name: "vdocs-server-document-worker",
      script: "./workers/documentWorker.js",
      cwd: "/var/www/backend-vdocs",
      exec_mode: "fork",
      instances: 1
    }
  ]
};