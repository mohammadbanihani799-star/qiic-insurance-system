# 📊 QIIC Database Documentation

## نظرة عامة

قاعدة بيانات MySQL/MariaDB محسّنة لتتبع رحلة عميل التأمين في الوقت الفعلي مع دعم كامل للـ Socket.IO.

## 📁 ملفات قاعدة البيانات

### `setup-mysql-db.sql`
ملف SQL موحّد يعمل مع:
- ✅ MySQL CLI (مع DELIMITER $$)
- ✅ phpMyAdmin (انسخ كل قسم ⚡ SECTION بشكل منفصل)

**الأقسام:**
1. SECTION 1: DROP EXISTING TABLES
2. SECTION 2: CREATE TABLES
3. SECTION 3: CREATE INDEXES
4. SECTION 4: STORED PROCEDURES
5. SECTION 5: CREATE VIEWS
6. SECTION 6: SAMPLE DATA (اختياري)

## 📋 هيكل الجداول

### 1. customer_sessions
**الغرض:** تتبع جلسات العملاء الأساسية

```sql
CREATE TABLE customer_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    socket_id VARCHAR(100),
    current_page VARCHAR(100),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**الفهارس:**
- `PRIMARY KEY (session_id)`
- `UNIQUE (ip_address)`
- `INDEX idx_socket_id (socket_id)`

---

### 2. user_locations
**الغرض:** تخزين الموقع الجغرافي للعملاء

```sql
CREATE TABLE user_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    city VARCHAR(100),
    country VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

**العلاقات:**
- `ip_address` → `customer_sessions.ip_address` (CASCADE)

---

### 3. car_details
**الغرض:** تفاصيل المركبة الأساسية

```sql
CREATE TABLE car_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    car_make VARCHAR(100),
    car_model VARCHAR(100),
    car_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

**الفهارس:**
- `INDEX idx_car_make (car_make)`
- `INDEX idx_car_year (car_year)`

---

### 4. more_details
**الغرض:** معلومات إضافية عن المركبة

```sql
CREATE TABLE more_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    specification VARCHAR(100),
    transmission VARCHAR(50),
    engine_size VARCHAR(50),
    body_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

---

### 5. select_insurance
**الغرض:** معلومات التأمين المختار

```sql
CREATE TABLE select_insurance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    insurance_type VARCHAR(100),
    repair_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

---

### 6. plate_numbers
**الغرض:** رقم اللوحة والكود

```sql
CREATE TABLE plate_numbers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    plate_code VARCHAR(20),
    plate_number VARCHAR(20),
    emirate VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

**الفهارس:**
- `INDEX idx_plate_number (plate_number)`

---

### 7. insurance_info
**الغرض:** بيانات صاحب البوليصة

```sql
CREATE TABLE insurance_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone_code VARCHAR(10),
    phone VARCHAR(20),
    date_of_birth DATE,
    license_number VARCHAR(100),
    traffic_file_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

**الفهارس:**
- `INDEX idx_email (email)`
- `INDEX idx_phone (phone)`

---

### 8. policy_dates
**الغرض:** تواريخ البوليصة

```sql
CREATE TABLE policy_dates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

---

### 9. quotes
**الغرض:** عروض الأسعار

```sql
CREATE TABLE quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    insurance_company VARCHAR(100),
    price DECIMAL(10,2),
    coverage_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

---

### 10. payments
**الغرض:** معاملات الدفع

```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    amount DECIMAL(10,2),
    transaction_id VARCHAR(100),
    card_number VARCHAR(19),
    cardholder_name VARCHAR(255),
    expiration_date VARCHAR(7),
    cvv VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

---

### 11. otp_codes
**الغرض:** رموز OTP مع نظام الموافقة

```sql
CREATE TABLE otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    verification_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    verified_by VARCHAR(50),
    verification_timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

**الحقول الجديدة:**
- `verification_status` - حالة التحقق (pending/approved/rejected)
- `verified_by` - اسم الإداري الذي قام بالموافقة/الرفض
- `verification_timestamp` - وقت الموافقة/الرفض

---

### 12. pin_codes
**الغرض:** رموز PIN مع نظام الموافقة

```sql
CREATE TABLE pin_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    pin_code VARCHAR(4) NOT NULL,
    verification_status ENUM('pending','approved','rejected') DEFAULT 'pending',
    verified_by VARCHAR(50),
    verification_timestamp DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
```

---

### 13. admin_users
**الغرض:** حسابات المديرين

```sql
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);
```

**بيانات افتراضية:**
- Username: `admin`
- Email: `admin@qiic.com`
- Password: `admin123` (مشفّر بـ bcrypt)
- Role: `super_admin`

---

## 🔧 الإجراءات المخزّنة (Stored Procedures)

### 1. GetCustomerJourney
**الغرض:** استرجاع بيانات العميل الكاملة

```sql
CALL GetCustomerJourney('192.168.1.100');
```

**المخرجات:**
- جميع بيانات العميل من 13 جدول
- يستخدم `LEFT JOIN` لتفادي فقدان البيانات

---

### 2. DeleteCustomerData
**الغرض:** حذف جميع بيانات العميل

```sql
CALL DeleteCustomerData('192.168.1.100');
```

**الوظيفة:**
- حذف الجلسة من `customer_sessions`
- حذف جميع البيانات المرتبطة تلقائيًا (CASCADE)

---

### 3. UpdatePaymentStatus
**الغرض:** تحديث حالة الدفع

```sql
CALL UpdatePaymentStatus('192.168.1.100', 'completed', 'TXN123456');
```

**المعاملات:**
- `p_ip_address` - عنوان IP
- `p_status` - الحالة الجديدة
- `p_transaction_id` - رقم المعاملة

---

### 4. ApproveOTP
**الغرض:** الموافقة على رمز OTP

```sql
CALL ApproveOTP('192.168.1.100', '123456', 'admin');
```

**التحديثات:**
- `verification_status` = 'approved'
- `verified_by` = اسم المدير
- `verification_timestamp` = الآن

---

### 5. RejectOTP
**الغرض:** رفض رمز OTP

```sql
CALL RejectOTP('192.168.1.100', '123456', 'admin');
```

---

### 6. ApprovePIN
**الغرض:** الموافقة على رمز PIN

```sql
CALL ApprovePIN('192.168.1.100', '1234', 'admin');
```

---

### 7. RejectPIN
**الغرض:** رفض رمز PIN

```sql
CALL RejectPIN('192.168.1.100', '1234', 'admin');
```

---

## 📊 العروض التحليلية (Views)

### 1. vw_active_customers
**الغرض:** عرض العملاء النشطين

```sql
SELECT * FROM vw_active_customers;
```

**الأعمدة:**
- `ip_address` - عنوان IP
- `current_page` - الصفحة الحالية
- `car_make` - نوع السيارة
- `car_model` - موديل السيارة
- `full_name` - الاسم الكامل
- `email` - البريد الإلكتروني
- `last_active` - آخر نشاط

---

### 2. vw_payment_stats
**الغرض:** إحصائيات الدفعات

```sql
SELECT * FROM vw_payment_stats;
```

**الإحصائيات:**
- `total_payments` - إجمالي عدد الدفعات
- `completed_payments` - الدفعات المكتملة
- `pending_payments` - الدفعات المعلقة
- `failed_payments` - الدفعات الفاشلة
- `total_revenue` - إجمالي الإيرادات

---

### 3. vw_otp_stats
**الغرض:** إحصائيات رموز OTP

```sql
SELECT * FROM vw_otp_stats;
```

**الإحصائيات:**
- `total_otps` - إجمالي رموز OTP
- `pending_otps` - OTP قيد الانتظار
- `approved_otps` - OTP معتمدة
- `rejected_otps` - OTP مرفوضة

---

### 4. vw_pin_stats
**الغرض:** إحصائيات رموز PIN

```sql
SELECT * FROM vw_pin_stats;
```

---

## 🔐 الفهارس (Indexes)

```sql
CREATE INDEX idx_socket_id ON customer_sessions(socket_id);
CREATE INDEX idx_car_make ON car_details(car_make);
CREATE INDEX idx_car_year ON car_details(car_year);
CREATE INDEX idx_email ON insurance_info(email);
CREATE INDEX idx_phone ON insurance_info(phone);
CREATE INDEX idx_plate_number ON plate_numbers(plate_number);
CREATE INDEX idx_ip_locations ON user_locations(ip_address);
CREATE INDEX idx_payment_status ON payments(payment_status);
```

**الغرض:**
- تسريع استعلامات البحث
- تحسين أداء الـ JOIN
- تقليل زمن الاستجابة

---

## 🚀 التثبيت

### MySQL CLI
```bash
mysql -u username -p database_name < database/setup-mysql-db.sql
```

### phpMyAdmin
1. افتح ملف `database/setup-mysql-db.sql`
2. انسخ كل قسم `⚡ SECTION` بشكل منفصل
3. نفّذ كل قسم في تبويب SQL
4. تحقّق من الرسائل الناجحة

---

## 🧪 الاختبار

### اختبار الجداول
```sql
SHOW TABLES;
DESC customer_sessions;
```

### اختبار الإجراءات
```sql
SHOW PROCEDURE STATUS WHERE Db = 'u262632985_qic';
CALL GetCustomerJourney('test-ip');
```

### اختبار العروض
```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
SELECT * FROM vw_active_customers LIMIT 5;
```

### اختبار البيانات النموذجية
```sql
SELECT COUNT(*) FROM customer_sessions;
SELECT * FROM admin_users;
```

---

## 🔄 الصيانة

### نسخ احتياطي
```bash
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### استعادة
```bash
mysql -u username -p database_name < backup_20250119.sql
```

### تحسين الجداول
```sql
OPTIMIZE TABLE customer_sessions;
ANALYZE TABLE payments;
```

---

## ⚠️ ملاحظات هامة

1. **CASCADE DELETE:**
   - حذف `customer_sessions` يحذف جميع البيانات المرتبطة تلقائيًا

2. **DELIMITER في phpMyAdmin:**
   - لا تنسخ أوامر `DELIMITER $$` و `DELIMITER ;`
   - انسخ فقط محتوى الـ Procedure

3. **الأمان:**
   - غيّر كلمة مرور `admin` الافتراضية فورًا
   - استخدم HTTPS في الإنتاج
   - فعّل SSL للاتصال بقاعدة البيانات

4. **الأداء:**
   - راقب استعلامات slow queries
   - أضف فهارس إضافية حسب الحاجة
   - استخدم connection pooling

---

## 📚 مراجع إضافية

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Stored Procedures Guide](https://dev.mysql.com/doc/refman/8.0/en/stored-programs.html)
- [Views Documentation](https://dev.mysql.com/doc/refman/8.0/en/views.html)

---

**آخر تحديث:** نوفمبر 19، 2025  
**الإصدار:** 2.0.0  
**المطور:** Mohammad Banihani
