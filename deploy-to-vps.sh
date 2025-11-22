#!/bin/bash

# QIIC Insurance System - VPS Deployment Script
# Server: 194.164.72.37 (France - Paris)
# OS: AlmaLinux 10
# Domain: ielts.sbs

echo "=================================="
echo "QIIC VPS Deployment Script"
echo "Server: 194.164.72.37"
echo "=================================="

# Update system
echo "📦 Updating system packages..."
sudo dnf update -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo dnf install -y git

# Install Nginx
echo "📦 Installing Nginx..."
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/qiic
sudo chown -R $USER:$USER /var/www/qiic
cd /var/www/qiic

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/mohammadbanihani799-star/qiic-insurance-system.git .

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd /var/www/qiic/backend
npm install --production

# Install frontend dependencies and build
echo "📦 Building frontend..."
cd /var/www/qiic/frontend
npm install
npm run build

# Copy frontend build to Nginx directory
echo "📋 Copying frontend files to Nginx..."
sudo mkdir -p /var/www/html/qiic
sudo cp -r dist/* /var/www/html/qiic/

# Create .env file for backend
echo "📝 Creating backend .env file..."
cd /var/www/qiic/backend
cat > .env << EOF
PORT=4000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=u262632985_qiic
DB_PASSWORD=Bon00@@71bon
DB_NAME=u262632985_qiic
DB_PORT=3306

# JWT Secret
JWT_SECRET=$(openssl rand -hex 32)

# CORS
CORS_ORIGIN=https://ielts.sbs
EOF

# Create Nginx configuration
echo "📝 Creating Nginx configuration..."
sudo tee /etc/nginx/conf.d/qiic.conf > /dev/null << 'EOF'
# Frontend Server
server {
    listen 80;
    server_name ielts.sbs www.ielts.sbs;
    
    root /var/www/html/qiic;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Socket.IO proxy
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Start backend with PM2
echo "🚀 Starting backend with PM2..."
cd /var/www/qiic/backend
pm2 start server.js --name qiic-backend
pm2 save
pm2 startup

# Setup firewall
echo "🔒 Configuring firewall..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Install Certbot for SSL
echo "🔐 Installing Certbot for SSL..."
sudo dnf install -y certbot python3-certbot-nginx

echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Install SSL certificate:"
echo "   sudo certbot --nginx -d ielts.sbs -d www.ielts.sbs"
echo ""
echo "2. Check backend status:"
echo "   pm2 status"
echo "   pm2 logs qiic-backend"
echo ""
echo "3. Visit your website:"
echo "   http://ielts.sbs"
echo ""
echo "4. Check Nginx status:"
echo "   sudo systemctl status nginx"
echo ""
echo "=================================="
