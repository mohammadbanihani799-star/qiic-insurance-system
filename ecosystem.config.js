/**
 * PM2 Ecosystem Configuration
 * Qatar Insurance & Indemnity Company - Vehicle Insurance System
 * 
 * استخدام:
 * pm2 start ecosystem.config.js
 * pm2 restart qiic-backend
 * pm2 logs qiic-backend
 * pm2 monit
 */

module.exports = {
  apps: [
    {
      // Backend Node.js Application
      name: 'qiic-backend',
      script: './backend/server.js',
      cwd: '/var/www/qiic',
      instances: 1, // يمكنك زيادتها إلى 2 لاستخدام كل نواة المعالج
      exec_mode: 'cluster',
      
      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      
      // Logging
      error_file: '/var/log/pm2/qiic-backend-error.log',
      out_file: '/var/log/pm2/qiic-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto Restart Configuration
      watch: false, // لا تستخدم watch في الإنتاج
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // Restart on file change (معطل للإنتاج)
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Kill timeout
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // Graceful Shutdown
      shutdown_with_message: true,
      wait_ready: true,
      
      // Source maps
      source_map_support: false,
      
      // Environment variables from .env file
      env_file: '/var/www/qiic/backend/.env.production'
    }
  ],

  /**
   * Deployment Configuration
   * استخدام: pm2 deploy production setup
   */
  deploy: {
    production: {
      user: 'root',
      host: '194.164.72.37',
      ref: 'origin/main',
      repo: 'git@github.com:YOUR_USERNAME/qiic.git', // ⚠️ غيّر هذا
      path: '/var/www/qiic',
      'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
