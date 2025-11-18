# ====================================
# QIIC Hostinger Deployment Script
# ====================================

$ErrorActionPreference = "Stop"

# Configuration
$VPS_IP = "194.164.72.37"
$VPS_USER = "root"
$DOMAIN = "ielts.sbs"
$PROJECT_NAME = "qiic"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   QIIC Hostinger Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "[1/5] Building Frontend..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "SUCCESS: Frontend built" -ForegroundColor Green
Write-Host ""

# Step 2: Create deployment package
Write-Host "[2/5] Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

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
Copy-Item -Path "backend\.env.production" -Destination "$tempDir\backend\.env" -Force
Copy-Item -Path "setup-hostinger-db.sql" -Destination "$tempDir\setup-db.sql" -Force

Write-Host "SUCCESS: Package created" -ForegroundColor Green
Write-Host ""

# Step 3: Compress package
Write-Host "[3/5] Compressing package..." -ForegroundColor Yellow
$packageName = "qiic-deploy.tar.gz"

if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $packageName -C $tempDir .
    Write-Host "SUCCESS: Package compressed with tar" -ForegroundColor Green
} else {
    $zipName = "qiic-deploy.zip"
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force
    Write-Host "SUCCESS: Package compressed with zip" -ForegroundColor Green
    $packageName = $zipName
}
Write-Host ""

# Step 4: Upload to VPS
Write-Host "[4/5] Uploading to VPS..." -ForegroundColor Yellow
Write-Host "Server: $VPS_IP" -ForegroundColor Gray
Write-Host "Domain: $DOMAIN" -ForegroundColor Gray
Write-Host ""

$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
if (-not (Test-Path $sshKeyPath)) {
    Write-Host "WARNING: SSH key not found. You'll need to enter password." -ForegroundColor Yellow
    Write-Host ""
}

# Upload using SCP
Write-Host "Uploading files..." -ForegroundColor Gray
scp $packageName "${VPS_USER}@${VPS_IP}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Upload failed!" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force
    exit 1
}
Write-Host "SUCCESS: Files uploaded" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy on server
Write-Host "[5/5] Deploying on server..." -ForegroundColor Yellow
Write-Host "Connecting to server and running deployment..." -ForegroundColor Gray

$isZip = $packageName.EndsWith(".zip")
$extractCmd = if ($isZip) { "unzip -o /tmp/$packageName" } else { "tar -xzf /tmp/$packageName" }

ssh "${VPS_USER}@${VPS_IP}" @"
set -e
echo 'Starting deployment...'

mkdir -p /var/www/$PROJECT_NAME
cd /var/www/$PROJECT_NAME

if [ -f /tmp/$packageName ]; then
    $extractCmd
    rm /tmp/$packageName
fi

echo 'Installing backend dependencies...'
cd backend
npm install --production
cd ..

echo 'Setting up PM2...'
pm2 delete $PROJECT_NAME-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo 'Configuring Nginx...'
cp nginx.conf /etc/nginx/conf.d/$PROJECT_NAME.conf
nginx -t && systemctl reload nginx

echo 'Setting up database...'
mysql -u u262632985_bon71 -p'Bon00@@71bon' u262632985_ilets < setup-db.sql

echo 'Deployment complete!'
pm2 status
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Remove-Item $tempDir -Recurse -Force
    exit 1
}
Write-Host "SUCCESS: Deployment successful" -ForegroundColor Green
Write-Host ""

# Cleanup
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force
Remove-Item $packageName -Force
Write-Host "SUCCESS: Cleanup complete" -ForegroundColor Green
Write-Host ""

# Final summary
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now live at:" -ForegroundColor Cyan
Write-Host "   http://$DOMAIN" -ForegroundColor White
Write-Host ""
Write-Host "To get SSL certificate, run on server:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor Gray
Write-Host "   certbot --nginx -d $DOMAIN -d www.$DOMAIN" -ForegroundColor Gray
Write-Host ""
Write-Host "To check server status:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_IP} 'pm2 status'" -ForegroundColor Gray
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "   ssh ${VPS_USER}@${VPS_IP} 'pm2 logs $PROJECT_NAME-backend'" -ForegroundColor Gray
Write-Host ""
