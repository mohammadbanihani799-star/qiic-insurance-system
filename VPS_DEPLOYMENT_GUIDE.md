# 🚀 دليل النشر على VPS - QIIC Insurance System

## 📋 معلومات الخادم

```
IP Address:    194.164.72.37
Location:      France - Paris
OS:            AlmaLinux 10
Hostname:      ns1.dns-parking.com
Domain:        ielts.sbs
SSH User:      root
SSH Password:  Bon00@@71bon
```

## 📊 قاعدة البيانات MySQL

```
Database Name: u262632985_qiic
Username:      u262632985_qiic
Password:      Bon00@@71bon
Host:          localhost
Port:          3306
```

---

## 🔧 الطريقة 1: النشر الآلي (الأسهل)

### 1️⃣ الاتصال بالخادم عبر SSH

```powershell
# من PowerShell على Windows
ssh root@194.164.72.37
# أدخل كلمة المرور: Bon00@@71bon
```

### 2️⃣ تحميل وتشغيل السكريبت

```bash
# تحميل السكريبت
curl -o deploy.sh https://raw.githubusercontent.com/mohammadbanihani799-star/qiic-insurance-system/main/deploy-to-vps.sh

# إعطاء صلاحيات التنفيذ
chmod +x deploy.sh

# تشغيل السكريبت
./deploy.sh
```

### 3️⃣ تثبيت شهادة SSL

```bash
# بعد انتهاء السكريبت، قم بتثبيت SSL
sudo certbot --nginx -d ielts.sbs -d www.ielts.sbs
# اتبع التعليمات وأدخل بريدك الإلكتروني
```

### 4️⃣ التحقق من التشغيل

```bash
# فحص حالة Backend
pm2 status

# مشاهدة السجلات
pm2 logs qiic-backend

# فحص Nginx
sudo systemctl status nginx

# زيارة الموقع
# افتح المتصفح: https://ielts.sbs
```

---

## 🛠️ الطريقة 2: النشر اليدوي (خطوة بخطوة)

### الخطوة 1: تحديث النظام وتثبيت الأدوات

```bash
# تحديث النظام
sudo dnf update -y

# تثبيت Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# تثبيت Git
sudo dnf install -y git

# تثبيت Nginx
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# تثبيت PM2
sudo npm install -g pm2

# تثبيت MySQL/MariaDB (إذا لم يكن مثبتاً)
sudo dnf install -y mariadb-server
sudo systemctl enable mariadb
sudo systemctl start mariadb
```

### الخطوة 2: إعداد MySQL

```bash
# تأمين MySQL
sudo mysql_secure_installation

# الدخول إلى MySQL
sudo mysql -u root -p

# إنشاء قاعدة البيانات والمستخدم
CREATE DATABASE IF NOT EXISTS u262632985_qiic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'u262632985_qiic'@'localhost' IDENTIFIED BY 'Bon00@@71bon';
GRANT ALL PRIVILEGES ON u262632985_qiic.* TO 'u262632985_qiic'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### الخطوة 3: استنساخ المشروع

```bash
# إنشاء مجلد التطبيق
sudo mkdir -p /var/www/qiic
sudo chown -R $USER:$USER /var/www/qiic

# استنساخ المشروع
cd /var/www/qiic
git clone https://github.com/mohammadbanihani799-star/qiic-insurance-system.git .
```

### الخطوة 4: إعداد Backend

```bash
# الانتقال لمجلد Backend
cd /var/www/qiic/backend

# تثبيت التبعيات
npm install --production

# نسخ ملف البيئة
cp .env.production .env

# تحرير ملف .env (اختياري)
nano .env

# استيراد قاعدة البيانات
mysql -u u262632985_qiic -p u262632985_qiic < ../database/setup-mysql-db.sql
# أدخل كلمة المرور: Bon00@@71bon
```

### الخطوة 5: بناء Frontend

```bash
# الانتقال لمجلد Frontend
cd /var/www/qiic/frontend

# تثبيت التبعيات
npm install

# بناء الإنتاج
npm run build

# نسخ الملفات إلى Nginx
sudo mkdir -p /var/www/html/qiic
sudo cp -r dist/* /var/www/html/qiic/
sudo cp /var/www/qiic/.htaccess /var/www/html/qiic/
```

### الخطوة 6: إعداد Nginx

```bash
# إنشاء ملف التكوين
sudo nano /etc/nginx/conf.d/qiic.conf
```

أضف المحتوى التالي:

```nginx
server {
    listen 80;
    server_name ielts.sbs www.ielts.sbs;
    
    root /var/www/html/qiic;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets caching
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

حفظ الملف: `Ctrl + X` → `Y` → `Enter`

```bash
# فحص التكوين
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

### الخطوة 7: تشغيل Backend مع PM2

```bash
# الانتقال لمجلد Backend
cd /var/www/qiic/backend

# بدء التطبيق
pm2 start server.js --name qiic-backend

# حفظ قائمة PM2
pm2 save

# تفعيل التشغيل التلقائي عند إعادة التشغيل
pm2 startup
# نفذ الأمر الذي سيظهر
```

### الخطوة 8: تكوين الجدار الناري

```bash
# فتح منافذ HTTP و HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --reload

# التحقق
sudo firewall-cmd --list-all
```

### الخطوة 9: تثبيت شهادة SSL

```bash
# تثبيت Certbot
sudo dnf install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d ielts.sbs -d www.ielts.sbs

# اتبع التعليمات:
# 1. أدخل بريدك الإلكتروني
# 2. اقبل شروط الخدمة: Y
# 3. اختر إعادة التوجيه إلى HTTPS: 2
```

### الخطوة 10: التحقق النهائي

```bash
# فحص PM2
pm2 status
pm2 logs qiic-backend

# فحص Nginx
sudo systemctl status nginx

# فحص اتصال قاعدة البيانات
mysql -u u262632985_qiic -p u262632985_qiic -e "SHOW TABLES;"
```

---

## 🔄 التحديثات المستقبلية

عند إجراء تحديثات على الكود:

```bash
# 1. الاتصال بالخادم
ssh root@194.164.72.37

# 2. الانتقال لمجلد المشروع
cd /var/www/qiic

# 3. سحب آخر التحديثات
git pull origin main

# 4. تحديث Backend
cd backend
npm install --production
pm2 restart qiic-backend

# 5. إعادة بناء Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/qiic/

# 6. إعادة تحميل Nginx
sudo systemctl reload nginx
```

---

## 📊 أوامر الإدارة المهمة

### PM2 (Backend)
```bash
pm2 status                    # عرض الحالة
pm2 logs qiic-backend        # عرض السجلات
pm2 restart qiic-backend     # إعادة التشغيل
pm2 stop qiic-backend        # إيقاف
pm2 start qiic-backend       # بدء
pm2 monit                    # مراقبة مباشرة
```

### Nginx
```bash
sudo systemctl status nginx   # الحالة
sudo systemctl restart nginx  # إعادة التشغيل
sudo systemctl reload nginx   # إعادة التحميل
sudo nginx -t                 # فحص التكوين
sudo tail -f /var/log/nginx/error.log  # سجل الأخطاء
```

### MySQL
```bash
sudo systemctl status mariadb      # الحالة
mysql -u u262632985_qiic -p        # الدخول
sudo tail -f /var/log/mariadb/mariadb.log  # السجلات
```

### الجدار الناري
```bash
sudo firewall-cmd --list-all       # عرض القواعد
sudo firewall-cmd --reload         # إعادة التحميل
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: Backend لا يعمل
```bash
# فحص السجلات
pm2 logs qiic-backend

# التحقق من المنفذ
sudo netstat -tulpn | grep 4000

# إعادة التشغيل
pm2 restart qiic-backend
```

### المشكلة 2: قاعدة البيانات لا تتصل
```bash
# فحص MySQL
sudo systemctl status mariadb

# اختبار الاتصال
mysql -u u262632985_qiic -p -h localhost

# فحص الصلاحيات
mysql -u root -p -e "SHOW GRANTS FOR 'u262632985_qiic'@'localhost';"
```

### المشكلة 3: Nginx يعطي 502
```bash
# فحص Backend
pm2 status

# فحص Nginx
sudo nginx -t
sudo systemctl status nginx

# فحص السجلات
sudo tail -f /var/log/nginx/error.log
```

### المشكلة 4: SSL لا يعمل
```bash
# تجديد الشهادة
sudo certbot renew --dry-run

# إعادة الحصول على الشهادة
sudo certbot --nginx -d ielts.sbs --force-renewal
```

---

## 📝 نصائح الأمان

1. **تغيير كلمات المرور الافتراضية**
```bash
# تغيير كلمة مرور root
passwd

# تغيير كلمة مرور MySQL
mysql -u root -p
ALTER USER 'u262632985_qiic'@'localhost' IDENTIFIED BY 'new-strong-password';
```

2. **تعطيل تسجيل الدخول كـ root عبر SSH**
```bash
sudo nano /etc/ssh/sshd_config
# غيّر: PermitRootLogin no
sudo systemctl restart sshd
```

3. **تثبيت Fail2Ban**
```bash
sudo dnf install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

4. **تحديثات أمنية منتظمة**
```bash
sudo dnf update -y
```

---

## ✅ Checklist النشر

- [ ] تم تثبيت Node.js و npm
- [ ] تم تثبيت Nginx
- [ ] تم تثبيت MySQL/MariaDB
- [ ] تم إنشاء قاعدة البيانات
- [ ] تم استنساخ المشروع
- [ ] تم بناء Frontend
- [ ] تم تكوين Nginx
- [ ] تم تشغيل Backend مع PM2
- [ ] تم فتح منافذ الجدار الناري
- [ ] تم تثبيت شهادة SSL
- [ ] تم اختبار الموقع
- [ ] تم ضبط النسخ الاحتياطي التلقائي

---

## 🆘 الدعم

إذا واجهت مشاكل:
1. راجع السجلات: `pm2 logs qiic-backend`
2. تحقق من Nginx: `sudo nginx -t`
3. فحص قاعدة البيانات: `mysql -u u262632985_qiic -p`

---

## 🎯 الوصول للموقع

بعد إتمام جميع الخطوات:
- **HTTP:** http://ielts.sbs
- **HTTPS:** https://ielts.sbs (بعد تثبيت SSL)
- **Admin Panel:** https://ielts.sbs/admin/login

---

✅ **تم! موقعك الآن على VPS الخاص بك**
