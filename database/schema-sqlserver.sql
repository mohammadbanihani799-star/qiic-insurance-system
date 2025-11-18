-- ============================================
-- QIIC Database Schema for SQL Server
-- Qatar Insurance in 2 Minutes
-- ============================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'qiic_insurance')
BEGIN
    CREATE DATABASE qiic_insurance
    COLLATE Arabic_CI_AS;
END
GO

USE qiic_insurance;
GO

-- ============================================
-- Table: customers
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[customers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[customers] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [phone] NVARCHAR(20) NOT NULL,
        [qatar_id] NVARCHAR(50) NOT NULL UNIQUE,
        [address] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE()
    );
    
    CREATE INDEX [idx_email] ON [dbo].[customers]([email]);
    CREATE INDEX [idx_phone] ON [dbo].[customers]([phone]);
    CREATE INDEX [idx_qatar_id] ON [dbo].[customers]([qatar_id]);
END
GO

-- ============================================
-- Table: vehicles
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vehicles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vehicles] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [customer_id] INT NOT NULL,
        [plate_number] NVARCHAR(50) NOT NULL,
        [make] NVARCHAR(100) NOT NULL,
        [model] NVARCHAR(100) NOT NULL,
        [year] INT NOT NULL,
        [chassis_number] NVARCHAR(100) NOT NULL UNIQUE,
        [engine_number] NVARCHAR(100) NOT NULL,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT [FK_vehicles_customer] FOREIGN KEY ([customer_id]) 
            REFERENCES [dbo].[customers]([id]) ON DELETE CASCADE
    );
    
    CREATE INDEX [idx_customer_id] ON [dbo].[vehicles]([customer_id]);
    CREATE INDEX [idx_plate_number] ON [dbo].[vehicles]([plate_number]);
    CREATE INDEX [idx_chassis_number] ON [dbo].[vehicles]([chassis_number]);
END
GO

-- ============================================
-- Table: policies
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[policies]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[policies] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [customer_id] INT NOT NULL,
        [vehicle_id] INT NOT NULL,
        [policy_number] NVARCHAR(50) NOT NULL UNIQUE,
        [type] NVARCHAR(20) NOT NULL CHECK ([type] IN ('comprehensive', 'third-party')),
        [premium] DECIMAL(10, 2) NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [status] NVARCHAR(20) DEFAULT 'active' CHECK ([status] IN ('active', 'expired', 'cancelled', 'pending')),
        [coins_earned] INT DEFAULT 100,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT [FK_policies_customer] FOREIGN KEY ([customer_id]) 
            REFERENCES [dbo].[customers]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_policies_vehicle] FOREIGN KEY ([vehicle_id]) 
            REFERENCES [dbo].[vehicles]([id]) ON DELETE NO ACTION
    );
    
    CREATE INDEX [idx_policies_customer_id] ON [dbo].[policies]([customer_id]);
    CREATE INDEX [idx_policies_vehicle_id] ON [dbo].[policies]([vehicle_id]);
    CREATE INDEX [idx_policy_number] ON [dbo].[policies]([policy_number]);
    CREATE INDEX [idx_policies_status] ON [dbo].[policies]([status]);
END
GO

-- ============================================
-- Table: claims
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[claims]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[claims] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [policy_id] INT NOT NULL,
        [customer_id] INT NOT NULL,
        [claim_number] NVARCHAR(50) NOT NULL UNIQUE,
        [type] NVARCHAR(100) NOT NULL,
        [description] NVARCHAR(MAX),
        [amount] DECIMAL(10, 2),
        [status] NVARCHAR(20) DEFAULT 'pending' CHECK ([status] IN ('pending', 'approved', 'rejected', 'processing')),
        [incident_date] DATE,
        [submitted_date] DATETIME2 DEFAULT GETDATE(),
        [resolved_date] DATETIME2 NULL,
        [notes] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT [FK_claims_policy] FOREIGN KEY ([policy_id]) 
            REFERENCES [dbo].[policies]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_claims_customer] FOREIGN KEY ([customer_id]) 
            REFERENCES [dbo].[customers]([id]) ON DELETE NO ACTION
    );
    
    CREATE INDEX [idx_claims_policy_id] ON [dbo].[claims]([policy_id]);
    CREATE INDEX [idx_claims_customer_id] ON [dbo].[claims]([customer_id]);
    CREATE INDEX [idx_claim_number] ON [dbo].[claims]([claim_number]);
    CREATE INDEX [idx_claims_status] ON [dbo].[claims]([status]);
END
GO

-- ============================================
-- Table: coins_transactions
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[coins_transactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[coins_transactions] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [customer_id] INT NOT NULL,
        [policy_id] INT NULL,
        [amount] INT NOT NULL,
        [type] NVARCHAR(20) DEFAULT 'earned' CHECK ([type] IN ('earned', 'redeemed', 'expired')),
        [description] NVARCHAR(255),
        [balance_after] INT NOT NULL,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT [FK_coins_customer] FOREIGN KEY ([customer_id]) 
            REFERENCES [dbo].[customers]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_coins_policy] FOREIGN KEY ([policy_id]) 
            REFERENCES [dbo].[policies]([id]) ON DELETE SET NULL
    );
    
    CREATE INDEX [idx_coins_customer_id] ON [dbo].[coins_transactions]([customer_id]);
    CREATE INDEX [idx_coins_type] ON [dbo].[coins_transactions]([type]);
END
GO

-- ============================================
-- Table: admin_users
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[admin_users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[admin_users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(100) NOT NULL UNIQUE,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [password_hash] NVARCHAR(255) NOT NULL,
        [full_name] NVARCHAR(255),
        [role] NVARCHAR(20) DEFAULT 'agent' CHECK ([role] IN ('super_admin', 'admin', 'agent')),
        [is_active] BIT DEFAULT 1,
        [last_login] DATETIME2 NULL,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE()
    );
    
    CREATE INDEX [idx_admin_username] ON [dbo].[admin_users]([username]);
    CREATE INDEX [idx_admin_email] ON [dbo].[admin_users]([email]);
    CREATE INDEX [idx_admin_role] ON [dbo].[admin_users]([role]);
END
GO

-- ============================================
-- Trigger: Update updated_at on customers
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_customers_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_customers_updated_at
    ON [dbo].[customers]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[customers]
        SET [updated_at] = GETDATE()
        FROM [dbo].[customers] c
        INNER JOIN inserted i ON c.id = i.id;
    END
    ');
END
GO

-- ============================================
-- Insert Sample Data
-- ============================================

-- Sample Customer
IF NOT EXISTS (SELECT * FROM [dbo].[customers] WHERE [email] = 'ahmed.mohamed@example.com')
BEGIN
    INSERT INTO [dbo].[customers] ([name], [email], [phone], [qatar_id], [address]) VALUES
    (N'أحمد محمد علي', 'ahmed.mohamed@example.com', '+97433334444', '12345678901', N'الدوحة، قطر'),
    (N'فاطمة حسن', 'fatima.hassan@example.com', '+97455556666', '23456789012', N'الريان، قطر'),
    (N'خالد عبدالله', 'khaled.abdullah@example.com', '+97466667777', '34567890123', N'الوكرة، قطر');
END
GO

-- Sample Vehicle
IF NOT EXISTS (SELECT * FROM [dbo].[vehicles] WHERE [plate_number] = '123456')
BEGIN
    INSERT INTO [dbo].[vehicles] ([customer_id], [plate_number], [make], [model], [year], [chassis_number], [engine_number]) VALUES
    (1, '123456', 'Toyota', 'Camry', 2024, 'ABC123XYZ456789', 'ENG123456'),
    (2, '234567', 'Nissan', 'Altima', 2023, 'DEF456UVW789012', 'ENG234567'),
    (3, '345678', 'Honda', 'Accord', 2022, 'GHI789RST345678', 'ENG345678');
END
GO

-- Sample Policy
IF NOT EXISTS (SELECT * FROM [dbo].[policies] WHERE [policy_number] = 'POL-2025-001')
BEGIN
    INSERT INTO [dbo].[policies] ([customer_id], [vehicle_id], [policy_number], [type], [premium], [start_date], [end_date], [status], [coins_earned]) VALUES
    (1, 1, 'POL-2025-001', 'comprehensive', 1200.00, '2025-01-01', '2026-01-01', 'active', 100),
    (2, 2, 'POL-2025-002', 'third-party', 500.00, '2025-02-01', '2026-02-01', 'active', 50),
    (3, 3, 'POL-2024-003', 'comprehensive', 1150.00, '2024-11-01', '2025-11-01', 'active', 100);
END
GO

-- Sample Claim
IF NOT EXISTS (SELECT * FROM [dbo].[claims] WHERE [claim_number] = 'CLM-2025-001')
BEGIN
    INSERT INTO [dbo].[claims] ([policy_id], [customer_id], [claim_number], [type], [description], [amount], [status], [incident_date]) VALUES
    (1, 1, 'CLM-2025-001', 'Accident', N'حادث بسيط في موقف السيارات', 2500.00, 'processing', '2025-10-15'),
    (3, 3, 'CLM-2025-002', 'Windshield', N'تلف الزجاج الأمامي', 800.00, 'approved', '2025-09-20');
END
GO

-- Sample Coins Transaction
IF NOT EXISTS (SELECT * FROM [dbo].[coins_transactions] WHERE [customer_id] = 1 AND [policy_id] = 1)
BEGIN
    INSERT INTO [dbo].[coins_transactions] ([customer_id], [policy_id], [amount], [type], [description], [balance_after]) VALUES
    (1, 1, 100, 'earned', N'مكافأة شراء وثيقة تأمين شامل', 100),
    (2, 2, 50, 'earned', N'مكافأة شراء وثيقة تأمين ضد الغير', 50),
    (3, 3, 100, 'earned', N'مكافأة شراء وثيقة تأمين شامل', 100);
END
GO

-- Sample Admin User
IF NOT EXISTS (SELECT * FROM [dbo].[admin_users] WHERE [username] = 'admin')
BEGIN
    INSERT INTO [dbo].[admin_users] ([username], [email], [password_hash], [full_name], [role]) VALUES
    ('admin', 'admin@qiic.com', '$2a$10$rQ6P4B0qZq1xKj.nh9z8OeVX3j2FxJmYqN7.QxH8vK3Lm9N5p6Q7W', N'مدير النظام', 'super_admin');
END
GO

-- ============================================
-- Views for Reports
-- ============================================

-- Active Policies View
IF OBJECT_ID('dbo.active_policies_view', 'V') IS NOT NULL
    DROP VIEW [dbo].[active_policies_view];
GO

CREATE VIEW [dbo].[active_policies_view] AS
SELECT 
    p.[id],
    p.[policy_number],
    c.[name] AS customer_name,
    c.[email] AS customer_email,
    c.[phone] AS customer_phone,
    v.[plate_number],
    CONCAT(v.[make], ' ', v.[model], ' ', v.[year]) AS vehicle_info,
    p.[type],
    p.[premium],
    p.[start_date],
    p.[end_date],
    p.[coins_earned],
    p.[status]
FROM [dbo].[policies] p
JOIN [dbo].[customers] c ON p.[customer_id] = c.[id]
JOIN [dbo].[vehicles] v ON p.[vehicle_id] = v.[id]
WHERE p.[status] = 'active';
GO

-- Claims Summary View
IF OBJECT_ID('dbo.claims_summary_view', 'V') IS NOT NULL
    DROP VIEW [dbo].[claims_summary_view];
GO

CREATE VIEW [dbo].[claims_summary_view] AS
SELECT 
    cl.[id],
    cl.[claim_number],
    c.[name] AS customer_name,
    p.[policy_number],
    cl.[type],
    cl.[amount],
    cl.[status],
    cl.[incident_date],
    cl.[submitted_date]
FROM [dbo].[claims] cl
JOIN [dbo].[customers] c ON cl.[customer_id] = c.[id]
JOIN [dbo].[policies] p ON cl.[policy_id] = p.[id];
GO

-- Customer Coins Balance View
IF OBJECT_ID('dbo.customer_coins_balance_view', 'V') IS NOT NULL
    DROP VIEW [dbo].[customer_coins_balance_view];
GO

CREATE VIEW [dbo].[customer_coins_balance_view] AS
SELECT 
    c.[id] AS customer_id,
    c.[name] AS customer_name,
    c.[email],
    ISNULL(SUM(CASE WHEN ct.[type] = 'earned' THEN ct.[amount] ELSE 0 END), 0) AS total_earned,
    ISNULL(SUM(CASE WHEN ct.[type] = 'redeemed' THEN ct.[amount] ELSE 0 END), 0) AS total_redeemed,
    ISNULL(SUM(CASE WHEN ct.[type] = 'earned' THEN ct.[amount] ELSE -ct.[amount] END), 0) AS current_balance
FROM [dbo].[customers] c
LEFT JOIN [dbo].[coins_transactions] ct ON c.[id] = ct.[customer_id]
GROUP BY c.[id], c.[name], c.[email];
GO

-- ============================================
-- Stored Procedures
-- ============================================

-- Procedure: Generate Policy Number
IF OBJECT_ID('dbo.generate_policy_number', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[generate_policy_number];
GO

CREATE PROCEDURE [dbo].[generate_policy_number]
    @new_policy_number NVARCHAR(50) OUTPUT
AS
BEGIN
    DECLARE @year_part NVARCHAR(4);
    DECLARE @sequence INT;
    
    SET @year_part = CAST(YEAR(GETDATE()) AS NVARCHAR(4));
    
    SELECT @sequence = ISNULL(MAX(CAST(RIGHT([policy_number], 3) AS INT)), 0) + 1
    FROM [dbo].[policies]
    WHERE [policy_number] LIKE 'POL-' + @year_part + '-%';
    
    SET @new_policy_number = 'POL-' + @year_part + '-' + RIGHT('000' + CAST(@sequence AS NVARCHAR), 3);
END
GO

-- Procedure: Generate Claim Number
IF OBJECT_ID('dbo.generate_claim_number', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[generate_claim_number];
GO

CREATE PROCEDURE [dbo].[generate_claim_number]
    @new_claim_number NVARCHAR(50) OUTPUT
AS
BEGIN
    DECLARE @year_part NVARCHAR(4);
    DECLARE @sequence INT;
    
    SET @year_part = CAST(YEAR(GETDATE()) AS NVARCHAR(4));
    
    SELECT @sequence = ISNULL(MAX(CAST(RIGHT([claim_number], 3) AS INT)), 0) + 1
    FROM [dbo].[claims]
    WHERE [claim_number] LIKE 'CLM-' + @year_part + '-%';
    
    SET @new_claim_number = 'CLM-' + @year_part + '-' + RIGHT('000' + CAST(@sequence AS NVARCHAR), 3);
END
GO

-- Procedure: Add Coins Transaction
IF OBJECT_ID('dbo.add_coins_transaction', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[add_coins_transaction];
GO

CREATE PROCEDURE [dbo].[add_coins_transaction]
    @p_customer_id INT,
    @p_policy_id INT,
    @p_amount INT,
    @p_type NVARCHAR(20),
    @p_description NVARCHAR(255)
AS
BEGIN
    DECLARE @current_balance INT;
    
    -- Get current balance
    SELECT @current_balance = ISNULL(SUM(CASE WHEN [type] = 'earned' THEN [amount] ELSE -[amount] END), 0)
    FROM [dbo].[coins_transactions]
    WHERE [customer_id] = @p_customer_id;
    
    -- Add new transaction
    INSERT INTO [dbo].[coins_transactions] ([customer_id], [policy_id], [amount], [type], [description], [balance_after])
    VALUES (@p_customer_id, @p_policy_id, @p_amount, @p_type, @p_description, 
            @current_balance + CASE WHEN @p_type = 'earned' THEN @p_amount ELSE -@p_amount END);
END
GO

-- ============================================
-- Additional Composite Indexes for Performance
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_policies_customer_status')
    CREATE INDEX [idx_policies_customer_status] ON [dbo].[policies]([customer_id], [status]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_policies_dates')
    CREATE INDEX [idx_policies_dates] ON [dbo].[policies]([start_date], [end_date]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_claims_dates')
    CREATE INDEX [idx_claims_dates] ON [dbo].[claims]([incident_date], [submitted_date]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_vehicles_make_model')
    CREATE INDEX [idx_vehicles_make_model] ON [dbo].[vehicles]([make], [model]);

GO

-- ============================================
-- Backup Information
-- ============================================

-- لعمل نسخة احتياطية (SQL Server):
-- BACKUP DATABASE qiic_insurance TO DISK = 'C:\Backups\qiic_backup_YYYYMMDD.bak'

-- لاستعادة النسخة الاحتياطية:
-- RESTORE DATABASE qiic_insurance FROM DISK = 'C:\Backups\qiic_backup_YYYYMMDD.bak'

-- ============================================
-- End of Schema
-- ============================================
