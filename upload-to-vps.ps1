# ═══════════════════════════════════════════════════════════════
# 🚀 نقل الملفات إلى VPS باستخدام SCP
# ═══════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 رفع ملفات Frontend إلى VPS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# معلومات VPS
$VPS_IP = "194.164.72.37"
$VPS_USER = "root"
$VPS_PATH = "/var/www/html/dist"
$LOCAL_DIST = "C:\developer\QIIC\frontend\dist"

Write-Host "📋 معلومات الاتصال:" -ForegroundColor Yellow
Write-Host "   VPS: $VPS_IP" -ForegroundColor White
Write-Host "   User: $VPS_USER" -ForegroundColor White
Write-Host "   Path: $VPS_PATH" -ForegroundColor White
Write-Host ""

# التحقق من وجود مجلد dist
if (-not (Test-Path $LOCAL_DIST)) {
    Write-Host "❌ خطأ: مجلد dist غير موجود!" -ForegroundColor Red
    Write-Host "   المسار: $LOCAL_DIST" -ForegroundColor Red
    exit 1
}

Write-Host "✅ تم العثور على مجلد dist" -ForegroundColor Green
Write-Host ""

# عرض الملفات المطلوب رفعها
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📁 الملفات المطلوب رفعها:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$files = @(
    "index.html",
    "assets/index-DNtHMks8.js",
    "assets/index-Bsy0WF_g.css",
    "assets/react-core-CyvzqkFf.js",
    "assets/react-router-I5Oko-29.js",
    "assets/socket-io-CUkmNz_4.js",
    "assets/icons-vQu4F1pA.js"
)

foreach ($file in $files) {
    $fullPath = Join-Path $LOCAL_DIST $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length / 1KB
        Write-Host "   ✓ $file" -ForegroundColor Green -NoNewline
        Write-Host " ($([math]::Round($size, 2)) KB)" -ForegroundColor Gray
    } else {
        Write-Host "   ✗ $file (غير موجود)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 أوامر SCP للتنفيذ في VPS Terminal:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "# 1️⃣ إنشاء نسخة احتياطية من الملفات القديمة:" -ForegroundColor Magenta
Write-Host "cp -r $VPS_PATH $VPS_PATH.backup.`$(date +%Y%m%d_%H%M%S)" -ForegroundColor White
Write-Host ""

Write-Host "# 2️⃣ حذف الملفات القديمة:" -ForegroundColor Magenta
Write-Host "rm -f $VPS_PATH/assets/index-B5uxdLf-4.js" -ForegroundColor White
Write-Host "rm -f $VPS_PATH/assets/index-CFVA53ab.js" -ForegroundColor White
Write-Host "rm -f $VPS_PATH/assets/index-BrSuvDL4.js" -ForegroundColor White
Write-Host ""

Write-Host "# 3️⃣ رفع الملفات الجديدة (استخدم هذه الأوامر من جهازك المحلي):" -ForegroundColor Magenta
Write-Host ""
Write-Host "# رفع index.html" -ForegroundColor Green
Write-Host "scp `"$LOCAL_DIST\index.html`" ${VPS_USER}@${VPS_IP}:$VPS_PATH/" -ForegroundColor White
Write-Host ""
Write-Host "# رفع ملفات JavaScript و CSS" -ForegroundColor Green
Write-Host "scp `"$LOCAL_DIST\assets\index-DNtHMks8.js`" ${VPS_USER}@${VPS_IP}:$VPS_PATH/assets/" -ForegroundColor White
Write-Host "scp `"$LOCAL_DIST\assets\index-Bsy0WF_g.css`" ${VPS_USER}@${VPS_IP}:$VPS_PATH/assets/" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📝 أو استخدم أمر واحد لرفع جميع الملفات:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "scp -r `"$LOCAL_DIST/*`" ${VPS_USER}@${VPS_IP}:$VPS_PATH/" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ بعد رفع الملفات، اختبر الموقع:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. افتح: https://ielts.sbs/admin/login" -ForegroundColor White
Write-Host "2. تأكد من عدم ظهور رسالة 'الوصول غير مصرح به'" -ForegroundColor White
Write-Host "3. تحقق من تحميل index-DNtHMks8.js في Network Tab" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
