-- =============================================
-- QIIC Dynamic Tables System
-- Purpose: Create a separate table for each visitor (IP-based)
-- =============================================

USE u262632985_qic;

-- =============================================
-- Master Table: Tracks all visitor tables
-- =============================================
CREATE TABLE IF NOT EXISTS visitor_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    table_name VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    current_page VARCHAR(100),
    socket_id VARCHAR(255),
    INDEX idx_ip (ip_address),
    INDEX idx_table (table_name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STORED PROCEDURE: Create Dynamic Table for Each IP
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS CreateVisitorTable$$

CREATE PROCEDURE CreateVisitorTable(
    IN p_ip_address VARCHAR(45),
    OUT p_table_name VARCHAR(100),
    OUT p_success TINYINT(1)
)
BEGIN
    DECLARE v_clean_ip VARCHAR(45);
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_sql TEXT;
    
    -- Clean IP address (replace dots and colons with underscores)
    SET v_clean_ip = REPLACE(REPLACE(p_ip_address, '.', '_'), ':', '_');
    SET v_table_name = CONCAT('visitor_', v_clean_ip);
    
    -- Check if table already exists in visitor_tables
    SELECT COUNT(*) INTO v_exists 
    FROM visitor_tables 
    WHERE ip_address = p_ip_address;
    
    IF v_exists = 0 THEN
        -- Create the dynamic table
        SET @create_sql = CONCAT('
            CREATE TABLE IF NOT EXISTS `', v_table_name, '` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                data_type VARCHAR(50) NOT NULL COMMENT ''Type: car_details, insurance_info, payment, etc.'',
                data_json JSON NOT NULL COMMENT ''Complete form data in JSON format'',
                page_name VARCHAR(100) COMMENT ''Page where data was submitted'',
                step_number INT DEFAULT 0 COMMENT ''Step in customer journey'',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_type (data_type),
                INDEX idx_page (page_name),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ');
        
        PREPARE stmt FROM @create_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Register the table in visitor_tables
        INSERT INTO visitor_tables (ip_address, table_name, is_active)
        VALUES (p_ip_address, v_table_name, 1);
        
        SET p_success = 1;
    ELSE
        -- Table already exists, just update last_activity
        UPDATE visitor_tables 
        SET last_activity = CURRENT_TIMESTAMP,
            is_active = 1
        WHERE ip_address = p_ip_address;
        
        SET p_success = 1;
    END IF;
    
    SET p_table_name = v_table_name;
END$$

DELIMITER ;

-- =============================================
-- STORED PROCEDURE: Insert Data into Visitor Table
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS InsertVisitorData$$

CREATE PROCEDURE InsertVisitorData(
    IN p_ip_address VARCHAR(45),
    IN p_data_type VARCHAR(50),
    IN p_data_json JSON,
    IN p_page_name VARCHAR(100),
    IN p_step_number INT,
    OUT p_success TINYINT(1)
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_table_exists INT DEFAULT 0;
    
    -- Get table name for this IP
    SELECT table_name INTO v_table_name
    FROM visitor_tables
    WHERE ip_address = p_ip_address
    LIMIT 1;
    
    IF v_table_name IS NOT NULL THEN
        -- Insert data into visitor's table
        SET @insert_sql = CONCAT('
            INSERT INTO `', v_table_name, '` 
            (data_type, data_json, page_name, step_number)
            VALUES (?, ?, ?, ?)
        ');
        
        PREPARE stmt FROM @insert_sql;
        SET @data_type = p_data_type;
        SET @data_json = p_data_json;
        SET @page_name = p_page_name;
        SET @step_number = p_step_number;
        EXECUTE stmt USING @data_type, @data_json, @page_name, @step_number;
        DEALLOCATE PREPARE stmt;
        
        -- Update last_activity
        UPDATE visitor_tables 
        SET last_activity = CURRENT_TIMESTAMP,
            current_page = p_page_name
        WHERE ip_address = p_ip_address;
        
        SET p_success = 1;
    ELSE
        SET p_success = 0;
    END IF;
END$$

DELIMITER ;

-- =============================================
-- STORED PROCEDURE: Get All Visitor Data
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS GetVisitorData$$

CREATE PROCEDURE GetVisitorData(IN p_ip_address VARCHAR(45))
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    -- Get table name
    SELECT table_name INTO v_table_name
    FROM visitor_tables
    WHERE ip_address = p_ip_address
    LIMIT 1;
    
    IF v_table_name IS NOT NULL THEN
        -- Return all data from visitor's table
        SET @select_sql = CONCAT('
            SELECT 
                id,
                data_type,
                data_json,
                page_name,
                step_number,
                created_at,
                updated_at
            FROM `', v_table_name, '`
            ORDER BY created_at ASC
        ');
        
        PREPARE stmt FROM @select_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- =============================================
-- STORED PROCEDURE: Get All Visitors (Admin Dashboard)
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS GetAllVisitors$$

CREATE PROCEDURE GetAllVisitors()
BEGIN
    SELECT 
        ip_address,
        table_name,
        created_at,
        last_activity,
        is_active,
        current_page,
        socket_id,
        TIMESTAMPDIFF(SECOND, last_activity, NOW()) AS seconds_since_last_activity
    FROM visitor_tables
    ORDER BY last_activity DESC;
END$$

DELIMITER ;

-- =============================================
-- STORED PROCEDURE: Delete Visitor Table
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS DeleteVisitorTable$$

CREATE PROCEDURE DeleteVisitorTable(
    IN p_ip_address VARCHAR(45),
    OUT p_success TINYINT(1)
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    -- Get table name
    SELECT table_name INTO v_table_name
    FROM visitor_tables
    WHERE ip_address = p_ip_address
    LIMIT 1;
    
    IF v_table_name IS NOT NULL THEN
        -- Drop the table
        SET @drop_sql = CONCAT('DROP TABLE IF EXISTS `', v_table_name, '`');
        PREPARE stmt FROM @drop_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Remove from visitor_tables
        DELETE FROM visitor_tables WHERE ip_address = p_ip_address;
        
        SET p_success = 1;
    ELSE
        SET p_success = 0;
    END IF;
END$$

DELIMITER ;

-- =============================================
-- STORED PROCEDURE: Update Visitor Status
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS UpdateVisitorStatus$$

CREATE PROCEDURE UpdateVisitorStatus(
    IN p_ip_address VARCHAR(45),
    IN p_is_active TINYINT(1),
    IN p_current_page VARCHAR(100),
    IN p_socket_id VARCHAR(255)
)
BEGIN
    UPDATE visitor_tables
    SET 
        is_active = p_is_active,
        current_page = p_current_page,
        socket_id = p_socket_id,
        last_activity = CURRENT_TIMESTAMP
    WHERE ip_address = p_ip_address;
END$$

DELIMITER ;

-- =============================================
-- VIEW: Active Visitors Summary
-- =============================================
CREATE OR REPLACE VIEW vw_active_visitors AS
SELECT 
    v.ip_address,
    v.table_name,
    v.current_page,
    v.socket_id,
    v.created_at AS first_seen,
    v.last_activity,
    v.is_active,
    TIMESTAMPDIFF(MINUTE, v.created_at, v.last_activity) AS session_duration_minutes,
    TIMESTAMPDIFF(SECOND, v.last_activity, NOW()) AS idle_seconds
FROM visitor_tables v
WHERE v.is_active = 1
ORDER BY v.last_activity DESC;

-- =============================================
-- ADMIN HELPER: List All Visitor Tables
-- =============================================
-- Run this to see all created tables:
-- SELECT table_name FROM visitor_tables ORDER BY created_at DESC;

-- =============================================
-- ADMIN HELPER: View Specific Visitor Journey
-- =============================================
-- Example: CALL GetVisitorData('192.168.1.100');

-- =============================================
-- ADMIN HELPER: Clean Up Old Inactive Visitors
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS CleanupInactiveVisitors$$

CREATE PROCEDURE CleanupInactiveVisitors(IN p_days_inactive INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_ip VARCHAR(45);
    DECLARE v_table_name VARCHAR(100);
    DECLARE cur CURSOR FOR 
        SELECT ip_address, table_name 
        FROM visitor_tables 
        WHERE TIMESTAMPDIFF(DAY, last_activity, NOW()) > p_days_inactive;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_ip, v_table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Drop the table
        SET @drop_sql = CONCAT('DROP TABLE IF EXISTS `', v_table_name, '`');
        PREPARE stmt FROM @drop_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Remove from registry
        DELETE FROM visitor_tables WHERE ip_address = v_ip;
    END LOOP;
    
    CLOSE cur;
    
    SELECT CONCAT('Cleaned up ', ROW_COUNT(), ' inactive visitors') AS result;
END$$

DELIMITER ;

-- =============================================
-- EXAMPLE USAGE
-- =============================================

-- 1. Create table for new visitor:
-- CALL CreateVisitorTable('192.168.1.100', @table_name, @success);
-- SELECT @table_name, @success;

-- 2. Insert data for visitor:
-- CALL InsertVisitorData(
--     '192.168.1.100',
--     'car_details',
--     '{"make": "Toyota", "model": "Camry", "year": 2023}',
--     '/car-details',
--     1,
--     @success
-- );

-- 3. Get visitor data:
-- CALL GetVisitorData('192.168.1.100');

-- 4. Get all visitors:
-- CALL GetAllVisitors();

-- 5. Delete visitor:
-- CALL DeleteVisitorTable('192.168.1.100', @success);

-- 6. Cleanup inactive visitors (older than 30 days):
-- CALL CleanupInactiveVisitors(30);

-- =============================================
-- END OF DYNAMIC TABLES SCHEMA
-- =============================================
