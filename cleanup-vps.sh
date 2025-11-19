#!/bin/bash

# تنظيف الملفات القديمة
echo "Cleaning old files..."
cd /var/www/html/dist/assets
rm -f index-B5uxdLf-4.js
rm -f index-CFVA53ab.js
rm -f index-BrSuvDL4.js
echo "Old files removed."

# عرض الملفات الموجودة
echo ""
echo "Current files:"
ls -lh | grep index-

echo ""
echo "Ready to upload new files."
echo ""
echo "Upload these files from your local machine:"
echo "1. C:\developer\QIIC\frontend\dist\index.html -> /var/www/html/dist/"
echo "2. C:\developer\QIIC\frontend\dist\assets\index-DNtHMks8.js -> /var/www/html/dist/assets/"
echo "3. C:\developer\QIIC\frontend\dist\assets\index-Bsy0WF_g.css -> /var/www/html/dist/assets/"
