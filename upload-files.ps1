# Upload files to Hostinger VPS
$VPS_IP = "194.164.72.37"

Write-Host "📦 رفع ملفات Backend..." -ForegroundColor Cyan

# Backend files
$backendFiles = @(
    "backend/server.js",
    "backend/package.json",
    "backend/.env.production",
    "backend/middleware/auth.js",
    "backend/middleware/errorHandler.js",
    "backend/middleware/rateLimiter.js",
    "backend/middleware/validation.js",
    "backend/routes/admin.js",
    "backend/routes/auth.js",
    "backend/routes/claims.js",
    "backend/routes/coins.js",
    "backend/routes/customers.js",
    "backend/routes/policies.js",
    "backend/routes/reports.js",
    "backend/routes/vehicles.js",
    "backend/services/socketService.js",
    "backend/config/database.js"
)

foreach ($file in $backendFiles) {
    $localPath = "c:\developer\QIIC\$file"
    $remotePath = "/var/www/qiic/$($file -replace '\\', '/')"
    
    if (Test-Path $localPath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
        $remoteDir = Split-Path -Parent $remotePath
        ssh root@$VPS_IP "mkdir -p '$remoteDir'"
        Get-Content $localPath | ssh root@$VPS_IP "cat > '$remotePath'"
    } else {
        Write-Host "  ✗ $file (not found)" -ForegroundColor Red
    }
}

Write-Host "`n📦 رفع ملفات Frontend..." -ForegroundColor Cyan

# Copy entire dist folder
$distFiles = Get-ChildItem -Path "c:\developer\QIIC\frontend\dist" -Recurse -File

foreach ($file in $distFiles) {
    $relativePath = $file.FullName.Substring("c:\developer\QIIC\frontend\dist\".Length)
    $remotePath = "/var/www/qiic/frontend/dist/$($relativePath -replace '\\', '/')"
    
    Write-Host "  ✓ dist/$relativePath" -ForegroundColor Green
    $remoteDir = Split-Path -Parent $remotePath
    ssh root@$VPS_IP "mkdir -p '$remoteDir'"
    Get-Content $file.FullName -Raw | ssh root@$VPS_IP "cat > '$remotePath'"
}

Write-Host "`n📦 رفع ملفات التكوين..." -ForegroundColor Cyan

# Config files
$configFiles = @(
    "nginx.conf",
    "ecosystem.config.js",
    "setup-hostinger-db.sql"
)

foreach ($file in $configFiles) {
    $localPath = "c:\developer\QIIC\$file"
    $remotePath = "/var/www/qiic/$file"
    
    if (Test-Path $localPath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
        Get-Content $localPath | ssh root@$VPS_IP "cat > '$remotePath'"
    }
}

Write-Host "`n✅ تم رفع جميع الملفات!" -ForegroundColor Green
