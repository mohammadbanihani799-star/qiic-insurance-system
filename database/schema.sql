-- ============================================
-- QIIC Database Schema for MySQL/phpMyAdmin
-- Qatar Insurance in 2 Minutes
-- ============================================
-- @language mysql
-- This file uses MySQL syntax, not T-SQL (SQL Server)
-- If you see errors in VS Code, change language mode to "MySQL"

-- Create Database
CREATE DATABASE IF NOT EXISTS qiic_insurance 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE qiic_insurance;

-- ============================================
-- Table: customers
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    qatar_id VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_qatar_id (qatar_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: vehicles
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    chassis_number VARCHAR(100) NOT NULL UNIQUE,
    engine_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_plate_number (plate_number),
    INDEX idx_chassis_number (chassis_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: policies
-- ============================================
CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    policy_number VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('comprehensive', 'third-party') NOT NULL,
    premium DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'active',
    coins_earned INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_policy_number (policy_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: claims
-- ============================================
CREATE TABLE IF NOT EXISTS claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    customer_id INT NOT NULL,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2),
    status ENUM('pending', 'approved', 'rejected', 'processing') DEFAULT 'pending',
    incident_date DATE,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_policy_id (policy_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_claim_number (claim_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: coins_transactions
-- ============================================
CREATE TABLE IF NOT EXISTS coins_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    policy_id INT NULL,
    amount INT NOT NULL,
    type ENUM('earned', 'redeemed', 'expired') DEFAULT 'earned',
    description VARCHAR(255),
    balance_after INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: admin_users
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('super_admin', 'admin', 'agent') DEFAULT 'agent',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Sample Data
-- ============================================

-- Sample Customer
INSERT INTO customers (name, email, phone, qatar_id, address) VALUES
('أحمد محمد علي', 'ahmed.mohamed@example.com', '+97433334444', '12345678901', 'الدوحة، قطر'),
('فاطمة حسن', 'fatima.hassan@example.com', '+97455556666', '23456789012', 'الريان، قطر'),
('خالد عبدالله', 'khaled.abdullah@example.com', '+97466667777', '34567890123', 'الوكرة، قطر');

-- Sample Vehicle
INSERT INTO vehicles (customer_id, plate_number, make, model, year, chassis_number, engine_number) VALUES
(1, '123456', 'Toyota', 'Camry', 2024, 'ABC123XYZ456789', 'ENG123456'),
(2, '234567', 'Nissan', 'Altima', 2023, 'DEF456UVW789012', 'ENG234567'),
(3, '345678', 'Honda', 'Accord', 2022, 'GHI789RST345678', 'ENG345678');

-- Sample Policy
INSERT INTO policies (customer_id, vehicle_id, policy_number, type, premium, start_date, end_date, status, coins_earned) VALUES
(1, 1, 'POL-2025-001', 'comprehensive', 1200.00, '2025-01-01', '2026-01-01', 'active', 100),
(2, 2, 'POL-2025-002', 'third-party', 500.00, '2025-02-01', '2026-02-01', 'active', 50),
(3, 3, 'POL-2024-003', 'comprehensive', 1150.00, '2024-11-01', '2025-11-01', 'active', 100);

-- Sample Claim
INSERT INTO claims (policy_id, customer_id, claim_number, type, description, amount, status, incident_date) VALUES
(1, 1, 'CLM-2025-001', 'Accident', 'حادث بسيط في موقف السيارات', 2500.00, 'processing', '2025-10-15'),
(3, 3, 'CLM-2025-002', 'Windshield', 'تلف الزجاج الأمامي', 800.00, 'approved', '2025-09-20');

-- Sample Coins Transaction
INSERT INTO coins_transactions (customer_id, policy_id, amount, type, description, balance_after) VALUES
(1, 1, 100, 'earned', 'مكافأة شراء وثيقة تأمين شامل', 100),
(2, 2, 50, 'earned', 'مكافأة شراء وثيقة تأمين ضد الغير', 50),
(3, 3, 100, 'earned', 'مكافأة شراء وثيقة تأمين شامل', 100);

-- Sample Admin User (password: admin123 - يجب تغييره)
-- Note: استخدم bcrypt لتشفير كلمة المرور في التطبيق الفعلي
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@qiic.com', '$2a$10$rQ6P4B0qZq1xKj.nh9z8OeVX3j2FxJmYqN7.QxH8vK3Lm9N5p6Q7W', 'مدير النظام', 'super_admin');

-- ============================================
-- Views for Reports
-- ============================================

-- Active Policies View
CREATE OR REPLACE VIEW active_policies_view AS
SELECT 
    p.id,
    p.policy_number,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    v.plate_number,
    CONCAT(v.make, ' ', v.model, ' ', v.year) AS vehicle_info,
    p.type,
    p.premium,
    p.start_date,
    p.end_date,
    p.coins_earned,
    p.status
FROM policies p
JOIN customers c ON p.customer_id = c.id
JOIN vehicles v ON p.vehicle_id = v.id
WHERE p.status = 'active';

-- Claims Summary View
CREATE OR REPLACE VIEW claims_summary_view AS
SELECT 
    cl.id,
    cl.claim_number,
    c.name AS customer_name,
    p.policy_number,
    cl.type,
    cl.amount,
    cl.status,
    cl.incident_date,
    cl.submitted_date
FROM claims cl
JOIN customers c ON cl.customer_id = c.id
JOIN policies p ON cl.policy_id = p.id;

-- Customer Coins Balance View
CREATE OR REPLACE VIEW customer_coins_balance_view AS
SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    c.email,
    COALESCE(SUM(CASE WHEN ct.type = 'earned' THEN ct.amount ELSE 0 END), 0) AS total_earned,
    COALESCE(SUM(CASE WHEN ct.type = 'redeemed' THEN ct.amount ELSE 0 END), 0) AS total_redeemed,
    COALESCE(SUM(CASE WHEN ct.type = 'earned' THEN ct.amount ELSE -ct.amount END), 0) AS current_balance
FROM customers c
LEFT JOIN coins_transactions ct ON c.id = ct.customer_id
GROUP BY c.id, c.name, c.email;

-- ============================================
-- Stored Procedures
-- ============================================

DELIMITER $$

-- Procedure: Generate Policy Number
CREATE PROCEDURE generate_policy_number(OUT new_policy_number VARCHAR(50))
BEGIN
    DECLARE year_part VARCHAR(4);
    DECLARE sequence INT;
    
    SET year_part = YEAR(CURDATE());
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(policy_number, -3) AS UNSIGNED)), 0) + 1 
    INTO sequence
    FROM policies 
    WHERE policy_number LIKE CONCAT('POL-', year_part, '-%');
    
    SET new_policy_number = CONCAT('POL-', year_part, '-', LPAD(sequence, 3, '0'));
END$$

-- Procedure: Generate Claim Number
CREATE PROCEDURE generate_claim_number(OUT new_claim_number VARCHAR(50))
BEGIN
    DECLARE year_part VARCHAR(4);
    DECLARE sequence INT;
    
    SET year_part = YEAR(CURDATE());
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number, -3) AS UNSIGNED)), 0) + 1 
    INTO sequence
    FROM claims 
    WHERE claim_number LIKE CONCAT('CLM-', year_part, '-%');
    
    SET new_claim_number = CONCAT('CLM-', year_part, '-', LPAD(sequence, 3, '0'));
END$$

-- Procedure: Add Coins Transaction
CREATE PROCEDURE add_coins_transaction(
    IN p_customer_id INT,
    IN p_policy_id INT,
    IN p_amount INT,
    IN p_type ENUM('earned', 'redeemed', 'expired'),
    IN p_description VARCHAR(255)
)
BEGIN
    DECLARE current_balance INT;
    
    -- Get current balance
    SELECT COALESCE(SUM(CASE WHEN type = 'earned' THEN amount ELSE -amount END), 0)
    INTO current_balance
    FROM coins_transactions
    WHERE customer_id = p_customer_id;
    
    -- Add new transaction
    INSERT INTO coins_transactions (customer_id, policy_id, amount, type, description, balance_after)
    VALUES (p_customer_id, p_policy_id, p_amount, p_type, p_description, 
            current_balance + CASE WHEN p_type = 'earned' THEN p_amount ELSE -p_amount END);
END$$

DELIMITER ;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Additional composite indexes
CREATE INDEX idx_policies_customer_status ON policies(customer_id, status);
CREATE INDEX idx_policies_dates ON policies(start_date, end_date);
CREATE INDEX idx_claims_dates ON claims(incident_date, submitted_date);
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);

-- ============================================
-- Grant Privileges (للتطوير المحلي)
-- ============================================

-- للاستخدام المحلي - قم بتغيير كلمة المرور!
-- CREATE USER IF NOT EXISTS 'qiic_user'@'localhost' IDENTIFIED BY 'qiic_password_2025';
-- GRANT ALL PRIVILEGES ON qiic_insurance.* TO 'qiic_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- Backup Information
-- ============================================

-- لعمل نسخة احتياطية:
-- mysqldump -u root -p qiic_insurance > qiic_backup_YYYYMMDD.sql

-- لاستعادة النسخة الاحتياطية:
-- mysql -u root -p qiic_insurance < qiic_backup_YYYYMMDD.sql

-- ============================================
-- End of Schema
-- ============================================
