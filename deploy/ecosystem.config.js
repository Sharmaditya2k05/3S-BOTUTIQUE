// PM2 process manager config
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "3s-saree",
      script: "dist/index.js",
      cwd: "/opt/3s-saree/server",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/opt/3s-saree/logs/error.log",
      out_file: "/opt/3s-saree/logs/app.log",
      merge_logs: true,
    },
  ],
};
