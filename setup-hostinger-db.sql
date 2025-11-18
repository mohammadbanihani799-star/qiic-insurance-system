-- ============================================
-- QIIC Database Setup for Hostinger
-- Database: u262632985_qic
-- User: u262632985_qiic
-- ============================================

USE u262632985_qic;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    qid VARCHAR(50) UNIQUE,
    coins_balance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_qid (qid),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    chassis_number VARCHAR(100),
    vehicle_type VARCHAR(100),
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_plate (plate_number),
    INDEX idx_chassis (chassis_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    insurance_type VARCHAR(100) DEFAULT 'comprehensive',
    policy_start_date DATE,
    policy_end_date DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_policy_number (policy_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id INT PRIMARY KEY AUTO_INCREMENT,
    policy_id INT NOT NULL,
    customer_id INT NOT NULL,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    claim_type VARCHAR(100),
    claim_amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_claim_number (claim_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create coins_transactions table
CREATE TABLE IF NOT EXISTS coins_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    type ENUM('earned', 'redeemed', 'expired') NOT NULL,
    amount INT NOT NULL,
    description VARCHAR(255),
    policy_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL,
    INDEX idx_customer_type (customer_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('super_admin', 'admin', 'agent') DEFAULT 'agent',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO customers (name, email, phone, qid, coins_balance) VALUES
('أحمد محمد الكعبي', 'ahmed@example.com', '+97455123456', '28512345678', 150),
('فاطمة علي السليطي', 'fatima@example.com', '+97455987654', '28598765432', 200)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- Success message
-- ============================================
SELECT 'Database setup completed successfully!' AS message;
SELECT COUNT(*) AS total_customers FROM customers;
SELECT COUNT(*) AS total_vehicles FROM vehicles;
SELECT COUNT(*) AS total_policies FROM policies;
