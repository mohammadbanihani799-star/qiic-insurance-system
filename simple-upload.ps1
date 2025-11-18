# Simple file upload via SFTP
$VPS_IP = "194.164.72.37"

Write-Host "📦 Uploading files to $VPS_IP..." -ForegroundColor Cyan

# Create script for bulk file creation
$scriptContent = @"
#!/bin/bash
cd /var/www/qiic

# Create directory structure
mkdir -p backend/{config,middleware,models,routes,services,utils}
mkdir -p frontend/dist

echo "Directories created successfully"
"@

# Upload and execute directory creation script
$scriptContent | ssh root@$VPS_IP "cat > /tmp/create-dirs.sh; chmod +x /tmp/create-dirs.sh; /tmp/create-dirs.sh"

# Upload package.json and install dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Get-Content "c:\developer\QIIC\backend\package.json" | ssh root@$VPS_IP "cat > /var/www/qiic/backend/package.json"
ssh root@$VPS_IP "cd /var/www/qiic/backend; npm install --production 2>&1"

Write-Host "✅ Setup complete!" -ForegroundColor Green
