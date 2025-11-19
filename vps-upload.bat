@echo off
chcp 65001 >nul
color 0A
cls

echo ═══════════════════════════════════════════════════════════════
echo          UPLOAD FILES TO VPS - 194.164.72.37
echo ═══════════════════════════════════════════════════════════════
echo.

echo LOCAL PATH: C:\developer\QIIC\frontend\dist
echo VPS PATH: /var/www/html/dist
echo VPS IP: 194.164.72.37
echo.

echo ═══════════════════════════════════════════════════════════════
echo FILES TO UPLOAD:
echo ═══════════════════════════════════════════════════════════════
echo.

cd C:\developer\QIIC\frontend\dist
if exist index.html (
    echo [OK] index.html
) else (
    echo [MISSING] index.html
)

if exist assets\index-DNtHMks8.js (
    echo [OK] assets\index-DNtHMks8.js
) else (
    echo [MISSING] assets\index-DNtHMks8.js
)

if exist assets\index-Bsy0WF_g.css (
    echo [OK] assets\index-Bsy0WF_g.css
) else (
    echo [MISSING] assets\index-Bsy0WF_g.css
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo SCP COMMANDS - RUN THESE IN YOUR LOCAL TERMINAL:
echo ═══════════════════════════════════════════════════════════════
echo.

echo scp C:\developer\QIIC\frontend\dist\index.html root@194.164.72.37:/var/www/html/dist/
echo.
echo scp C:\developer\QIIC\frontend\dist\assets\index-DNtHMks8.js root@194.164.72.37:/var/www/html/dist/assets/
echo.
echo scp C:\developer\QIIC\frontend\dist\assets\index-Bsy0WF_g.css root@194.164.72.37:/var/www/html/dist/assets/
echo.

echo ═══════════════════════════════════════════════════════════════
echo OR USE THIS COMMAND IN VPS SSH:
echo ═══════════════════════════════════════════════════════════════
echo.
echo rm -f /var/www/html/dist/assets/index-B5uxdLf-4.js
echo rm -f /var/www/html/dist/assets/index-CFVA53ab.js
echo rm -f /var/www/html/dist/assets/index-BrSuvDL4.js
echo.
echo ═══════════════════════════════════════════════════════════════
pause
