# ====================================
# Hostinger Deployment Script
# نشر آلي كامل لمشروع QIIC
# ====================================

$ErrorActionPreference = "Stop"

# Configuration
$HOSTINGER_API_KEY = "nDs62yHxF18VYdzbavnE1ZUnlptMcyZXi31YsnXp0b06db65"
$VPS_IP = "194.164.72.37"
$VPS_USER = "root"
$DOMAIN = "ielts.sbs"
$PROJECT_NAME = "qiic"

# Database Configuration
$DB_NAME = "u262632985_qic"
$DB_USER = "u262632985_qiic"
$DB_PASSWORD = "Bon00@@71bon"
$SSH_PORT = 22

# Colors
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Step { param($step, $msg) Write-Host "[$step] $msg" -ForegroundColor Yellow }

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   QIIC Hostinger Deployment         " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "[1/6] Building Frontend..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Create deployment package
Write-Host "[2/6] Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packageName = "qiic-$timestamp.tar.gz"

# Create temporary directory
$tempDir = ".\deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files
Copy-Item -Path "backend" -Destination "$tempDir\backend" -Recurse -Force
Copy-Item -Path "frontend\dist" -Destination "$tempDir\frontend-dist" -Recurse -Force
Copy-Item -Path "nginx.conf" -Destination "$tempDir\nginx.conf" -Force
Copy-Item -Path "ecosystem.config.js" -Destination "$tempDir\ecosystem.config.js" -Force

# Copy environment files
Copy-Item -Path "backend\.env.production" -Destination "$tempDir\backend\.env" -Force
Copy-Item -Path "frontend\.env.production" -Destination "$tempDir\frontend\.env.production" -Force
Copy-Item -Path "setup-hostinger-db.sql" -Destination "$tempDir\setup-db.sql" -Force

Write-Host "✅ Package created" -ForegroundColor Green
Write-Host ""

# Step 3: Compress package
Write-Host "[3/6] Compressing package..." -ForegroundColor Yellow
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $packageName -C $tempDir .
} else {
    Compress-Archive -Path "$tempDir\*" -DestinationPath "qiic-$timestamp.zip" -Force
    $packageName = "qiic-$timestamp.zip"
}
Write-Host "✅ Package compressed: $packageName" -ForegroundColor Green
Write-Host ""

# Step 4: Upload to VPS
Write-Host "[4/6] Uploading to VPS..." -ForegroundColor Yellow
Write-Host "Server: $VPS_IP" -ForegroundColor Gray
Write-Host "Domain: $DOMAIN" -ForegroundColor Gray
Write-Host ""

# Check if SSH key exists
$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "⚠️  SSH key not found. You'll need to enter password." -ForegroundColor Yellow
    Write-Host "To setup SSH key, run: ssh-keygen -t rsa -b 4096" -ForegroundColor Gray
    Write-Host ""
}

# Upload using SCP
Write-Host "Uploading files (this may take a few minutes)..." -ForegroundColor Gray
scp $packageName "${VPS_USER}@${VPS_IP}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force
    exit 1
}
Write-Host "✅ Files uploaded" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy on server
Write-Host "[5/6] Deploying on server..." -ForegroundColor Yellow
$deployCommands = @"
set -e
echo '🚀 Starting deployment...'

# Create app directory
mkdir -p /var/www/$PROJECT_NAME
cd /var/www/$PROJECT_NAME

# Extract files
if [ -f /tmp/$packageName ]; then
    if [[ $packageName == *.tar.gz ]]; then
        tar -xzf /tmp/$packageName
    else
        unzip -o /tmp/$packageName
    fi
    rm /tmp/$packageName
fi

# Install backend dependencies
echo '📦 Installing backend dependencies...'
cd backend
npm install --production
cd ..

# Setup PM2
echo '🔧 Setting up PM2...'
pm2 delete $PROJECT_NAME-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup Nginx
echo '🌐 Configuring Nginx...'
cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/$PROJECT_NAME
nginx -t && systemctl reload nginx

# Setup Database
echo '🗄️  Setting up MySQL database...'
mysql -u $DB_USER -p'$DB_PASSWORD' $DB_NAME < setup-db.sql

# Get SSL certificate if not exists
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo '🔒 Getting SSL certificate...'
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN
fi

echo '✅ Deployment complete!'
echo '📊 Server status:'
pm2 status
"@

ssh "${VPS_USER}@${VPS_IP}" $deployCommands
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force
    exit 1
}
Write-Host "✅ Deployment successful" -ForegroundColor Green
Write-Host ""

# Step 6: Cleanup
Write-Host "[6/6] Cleaning up..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force
Remove-Item $packageName -Force
Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Final summary
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   ✅ DEPLOYMENT SUCCESSFUL!         " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is now live at:" -ForegroundColor Cyan
Write-Host "   https://$DOMAIN" -ForegroundColor White
Write-Host ""
Write-Host "📊 To check server status, run:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_IP} 'pm2 status'" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 To view logs, run:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_IP} 'pm2 logs $PROJECT_NAME-backend'" -ForegroundColor Gray
Write-Host ""
