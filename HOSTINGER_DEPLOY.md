# 🚀 دليل رفع QIIC على Hostinger

## المتطلبات الأساسية
- حساب Hostinger نشط
- FileZilla أو WinSCP مثبت
- Node.js مثبت محلياً

---

## 📦 الخطوة 1: بناء المشروع

```powershell
# من مجلد المشروع الرئيسي
cd C:\developer\QIIC\frontend

# تثبيت التبعيات
npm install

# بناء الإنتاج
npm run build
```

الملفات المبنية ستكون في: `frontend/dist/`

---

## 🔐 الخطوة 2: الحصول على بيانات FTP

1. سجل دخول إلى [hPanel Hostinger](https://hpanel.hostinger.com)
2. اذهب إلى **Files** → **FTP Accounts**
3. سجل البيانات:
   - **Host/Server:** `ftp.yourdomain.com`
   - **Username:** `u123456789` (مثال)
   - **Password:** كلمة المرور
   - **Port:** `21` (FTP) أو `22` (SFTP)

---

## 📤 الخطوة 3: رفع الملفات عبر FileZilla

### تحميل FileZilla
- [تحميل FileZilla Client](https://filezilla-project.org/download.php?type=client)

### الاتصال بالسيرفر
1. افتح FileZilla
2. أدخل البيانات:
   - Host: `ftp.yourdomain.com`
   - Username: اسم المستخدم
   - Password: كلمة المرور
   - Port: `21`
3. اضغط **Quickconnect**

### رفع الملفات
1. في الجانب الأيسر (Local): انتقل إلى `C:\developer\QIIC\frontend\dist`
2. في الجانب الأيمن (Remote): انتقل إلى `public_html`
3. احذف محتويات `public_html` القديمة (احتفظ بـ `.htaccess` إن وجد)
4. **اسحب وأفلت** كل محتويات `dist` إلى `public_html`:
   - `index.html`
   - مجلد `assets`
   - جميع ملفات `.js` و `.css`
5. ارفع ملف `.htaccess` من مجلد المشروع الرئيسي

---

## 🔧 الخطوة 4: إعدادات إضافية

### رفع ملف .htaccess
تأكد من رفع `.htaccess` إلى `public_html` لدعم React Router:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### تفعيل HTTPS
1. في hPanel → **Security** → **SSL**
2. فعّل **Let's Encrypt SSL** (مجاني)
3. انتظر 5-15 دقيقة للتفعيل

---

## ✅ الخطوة 5: التحقق

1. افتح موقعك: `https://yourdomain.com`
2. تحقق من:
   - ✅ الصفحة الرئيسية تظهر
   - ✅ الصور والأيقونات تظهر
   - ✅ التنقل بين الصفحات يعمل
   - ✅ النماذج تعمل بشكل صحيح

---

## 🐛 حل المشاكل الشائعة

### المشكلة: 404 عند تحديث الصفحة
**الحل:** تأكد من رفع `.htaccess` مع إعدادات Rewrite

### المشكلة: الصور لا تظهر
**الحل:** 
- تحقق من رفع مجلد `assets` كاملاً
- تأكد من المسارات في الكود (`/assets/...`)

### المشكلة: CSS/JS لا يعمل
**الحل:**
- امسح الكاش: `Ctrl + Shift + R`
- تحقق من Console في Developer Tools
- تأكد من رفع جميع ملفات `assets`

### المشكلة: الموقع بطيء
**الحل:**
- تأكد من تفعيل GZIP في `.htaccess`
- فعّل Cloudflare من hPanel

---

## 🔄 التحديثات المستقبلية

عند إجراء تعديلات:

```powershell
# 1. بناء جديد
cd C:\developer\QIIC\frontend
npm run build

# 2. رفع عبر FTP
# افتح FileZilla واسحب ملفات dist الجديدة

# 3. مسح الكاش
# في المتصفح: Ctrl + Shift + R
```

---

## 📝 ملاحظات مهمة

### للـ Frontend فقط
- Hostinger Shared Hosting يدعم HTML/CSS/JS فقط
- لا يدعم Node.js Backend مباشرة

### لرفع Backend أيضاً
تحتاج إلى:
- **VPS Hosting** من Hostinger
- أو استخدام **Hostinger Cloud Hosting**
- أو ربط Backend بخدمة خارجية (Render, Railway, Vercel)

---

## 🆘 الدعم الفني

- **Hostinger Support:** [https://www.hostinger.com/support](https://www.hostinger.com/support)
- **وثائق Hostinger:** [https://support.hostinger.com](https://support.hostinger.com)

---

## 📋 Checklist قبل الرفع

- [ ] تم بناء المشروع (`npm run build`)
- [ ] تم اختبار الملفات محلياً
- [ ] تم تجهيز بيانات FTP
- [ ] تم تحميل FileZilla/WinSCP
- [ ] تم نسخ احتياطي للملفات القديمة
- [ ] تم رفع `.htaccess`
- [ ] تم تفعيل SSL
- [ ] تم اختبار الموقع بعد الرفع

---

## 🎯 الخطوات السريعة (ملخص)

```powershell
# 1. Build
cd frontend && npm run build

# 2. Connect FTP (FileZilla)
# Host: ftp.yourdomain.com
# User: your-username
# Pass: your-password

# 3. Upload
# Local: frontend/dist/* → Remote: public_html/

# 4. Test
# https://yourdomain.com
```

✅ **تم! موقعك الآن على Hostinger**
