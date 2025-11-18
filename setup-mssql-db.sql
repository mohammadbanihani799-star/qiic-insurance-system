-- ============================================
-- QIIC Database Setup for Microsoft SQL Server
-- Database: u262632985_qic
-- Compatible with Azure SQL / SQL Server
-- ============================================

USE u262632985_qic;
GO

-- Drop tables if they exist (in correct order due to foreign keys)
IF OBJECT_ID('coins_transactions', 'U') IS NOT NULL DROP TABLE coins_transactions;
IF OBJECT_ID('claims', 'U') IS NOT NULL DROP TABLE claims;
IF OBJECT_ID('policies', 'U') IS NOT NULL DROP TABLE policies;
IF OBJECT_ID('vehicles', 'U') IS NOT NULL DROP TABLE vehicles;
IF OBJECT_ID('admin_users', 'U') IS NOT NULL DROP TABLE admin_users;
IF OBJECT_ID('customers', 'U') IS NOT NULL DROP TABLE customers;
GO

-- Create customers table
CREATE TABLE customers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    phone NVARCHAR(20),
    qid NVARCHAR(50) UNIQUE,
    coins_balance INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create indexes for customers
CREATE INDEX idx_email ON customers(email);
CREATE INDEX idx_qid ON customers(qid);
CREATE INDEX idx_phone ON customers(phone);
GO

-- Create vehicles table
CREATE TABLE vehicles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    plate_number NVARCHAR(50) NOT NULL UNIQUE,
    chassis_number NVARCHAR(100),
    vehicle_type NVARCHAR(100),
    vehicle_make NVARCHAR(100),
    vehicle_model NVARCHAR(100),
    vehicle_year NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_vehicles_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(id) ON DELETE CASCADE
);
GO

-- Create indexes for vehicles
CREATE INDEX idx_plate ON vehicles(plate_number);
CREATE INDEX idx_chassis ON vehicles(chassis_number);
GO

-- Create policies table
CREATE TABLE policies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    policy_number NVARCHAR(50) NOT NULL UNIQUE,
    insurance_type NVARCHAR(100) DEFAULT 'comprehensive',
    policy_start_date DATE,
    policy_end_date DATE,
    total_amount DECIMAL(10,2),
    status NVARCHAR(50) DEFAULT 'active',
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_policies_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT FK_policies_vehicle FOREIGN KEY (vehicle_id) 
        REFERENCES vehicles(id) ON DELETE NO ACTION
);
GO

-- Create indexes for policies
CREATE INDEX idx_policy_number ON policies(policy_number);
CREATE INDEX idx_status ON policies(status);
GO

-- Create claims table
CREATE TABLE claims (
    id INT IDENTITY(1,1) PRIMARY KEY,
    policy_id INT NOT NULL,
    customer_id INT NOT NULL,
    claim_number NVARCHAR(50) NOT NULL UNIQUE,
    claim_type NVARCHAR(100),
    claim_amount DECIMAL(10,2),
    status NVARCHAR(50) DEFAULT 'pending',
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_claims_policy FOREIGN KEY (policy_id) 
        REFERENCES policies(id) ON DELETE CASCADE,
    CONSTRAINT FK_claims_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(id) ON DELETE NO ACTION
);
GO

-- Create indexes for claims
CREATE INDEX idx_claim_number ON claims(claim_number);
CREATE INDEX idx_claim_status ON claims(status);
GO

-- Create coins_transactions table
CREATE TABLE coins_transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired')),
    amount INT NOT NULL,
    description NVARCHAR(255),
    policy_id INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_coins_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT FK_coins_policy FOREIGN KEY (policy_id) 
        REFERENCES policies(id) ON DELETE SET NULL
);
GO

-- Create indexes for coins_transactions
CREATE INDEX idx_customer_type ON coins_transactions(customer_id, type);
GO

-- Create admin_users table
CREATE TABLE admin_users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255),
    role NVARCHAR(20) DEFAULT 'agent' CHECK (role IN ('super_admin', 'admin', 'agent')),
    is_active BIT DEFAULT 1,
    last_login DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create indexes for admin_users
CREATE INDEX idx_username ON admin_users(username);
CREATE INDEX idx_email_admin ON admin_users(email);
CREATE INDEX idx_role ON admin_users(role);
GO

-- Insert sample data
SET IDENTITY_INSERT customers ON;
INSERT INTO customers (id, name, email, phone, qid, coins_balance) VALUES
(1, N'أحمد محمد الكعبي', 'ahmed@example.com', '+97455123456', '28512345678', 150),
(2, N'فاطمة علي السليطي', 'fatima@example.com', '+97455987654', '28598765432', 200);
SET IDENTITY_INSERT customers OFF;
GO

-- ============================================
-- Verification queries
-- ============================================
PRINT 'Database setup completed successfully!';
SELECT COUNT(*) AS total_customers FROM customers;
SELECT COUNT(*) AS total_vehicles FROM vehicles;
SELECT COUNT(*) AS total_policies FROM policies;
GO
