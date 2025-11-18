# 🎉 QIIC Insurance System - تم النشر بنجاح!

## 📋 معلومات النشر

### 🌐 الموقع
- **URL**: http://ielts.sbs
- **API**: http://ielts.sbs/api
- **Socket.IO**: http://ielts.sbs/socket.io

### 🖥️ معلومات الخادم
- **IP**: 194.164.72.37
- **OS**: AlmaLinux 10
- **Location**: Paris, France
- **Node.js**: v22.19.0
- **PM2**: v5.x
- **Nginx**: v1.26.3

### 📊 حالة الخدمات
```bash
# التحقق من حالة Backend
ssh root@194.164.72.37 "pm2 status"

# التحقق من حالة Nginx
ssh root@194.164.72.37 "systemctl status nginx"

# عرض logs
ssh root@194.164.72.37 "pm2 logs qiic-backend --lines 50"
```

## 🔧 إدارة التطبيق

### إعادة التشغيل
```bash
# إعادة تشغيل Backend
ssh root@194.164.72.37 "pm2 restart qiic-backend"

# إعادة تحميل Nginx
ssh root@194.164.72.37 "systemctl reload nginx"
```

### تحديث الكود
```bash
# على جهازك المحلي
cd c:\developer\QIIC
git add .
git commit -m "وصف التحديث"
git push origin main

# على الخادم
ssh root@194.164.72.37 "cd /var/www/qiic && git pull origin main && cd frontend && npm run build && pm2 restart qiic-backend"
```

## 📁 مسارات مهمة على الخادم
- **المشروع**: `/var/www/qiic`
- **Backend**: `/var/www/qiic/backend`
- **Frontend**: `/var/www/qiic/frontend/dist`
- **Nginx Config**: `/etc/nginx/conf.d/qiic.conf`
- **PM2 Logs**: `/var/log/pm2/`
- **Nginx Logs**: `/var/log/nginx/`

## 🔐 قاعدة البيانات MySQL (Hostinger)
- **Host**: localhost (على خادم Hostinger المنفصل)
- **Database**: u262632985_qic
- **User**: u262632985_qiic
- **Password**: Bon00@@71bon

⚠️ **ملاحظة**: قاعدة البيانات موجودة على خادم MySQL منفصل في Hostinger، تحتاج إلى إعداد الاتصال من لوحة تحكم Hostinger.

## 🔒 SSL Certificate (قريباً)
سيتم إضافة شهادة SSL لتفعيل HTTPS:
```bash
ssh root@194.164.72.37 "certbot --nginx -d ielts.sbs -d www.ielts.sbs --non-interactive --agree-tos -m admin@ielts.sbs"
```

## 📦 GitHub Repository
- **URL**: https://github.com/mohammadbanihani799-star/qiic-insurance-system
- **Branch**: main

## ✅ ما تم إنجازه
- ✅ رفع المشروع إلى GitHub
- ✅ نشر Backend على VPS (PM2)
- ✅ نشر Frontend (Nginx)
- ✅ تكوين Nginx reverse proxy
- ✅ تفعيل Socket.IO
- ✅ تشغيل تلقائي عند إعادة التشغيل (PM2 startup)
- ✅ ربط Domain (ielts.sbs)

## ⏳ الخطوات التالية
- [ ] إعداد اتصال قاعدة البيانات MySQL
- [ ] الحصول على شهادة SSL (Let's Encrypt)
- [ ] تفعيل HTTPS
- [ ] إعداد نسخ احتياطي تلقائي
- [ ] مراقبة الأداء والأخطاء

## 🎯 الوصول للموقع
افتح المتصفح وانتقل إلى: **http://ielts.sbs**

---
**تاريخ النشر**: 18 نوفمبر 2025
