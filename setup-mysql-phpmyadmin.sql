-- =============================================
-- QIIC Insurance System - phpMyAdmin Compatible Version
-- Purpose: Execute this file in phpMyAdmin (procedure by procedure)
-- Database: MySQL/MariaDB
-- Note: Copy each procedure separately in phpMyAdmin's SQL tab
-- =============================================

USE u262632985_qic;

-- =============================================
-- STEP 1: Drop existing procedures
-- =============================================
DROP PROCEDURE IF EXISTS GetCustomerJourney;
DROP PROCEDURE IF EXISTS DeleteCustomerData;
DROP PROCEDURE IF EXISTS UpdatePaymentStatus;
DROP PROCEDURE IF EXISTS ApproveOTP;
DROP PROCEDURE IF EXISTS RejectOTP;
DROP PROCEDURE IF EXISTS ApprovePIN;
DROP PROCEDURE IF EXISTS RejectPIN;

-- =============================================
-- STEP 2: Execute each procedure separately
-- Copy and execute ONE AT A TIME in phpMyAdmin
-- =============================================

-- Procedure 1/7: GetCustomerJourney
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
END;

-- =============================================
-- Procedure 2/7: DeleteCustomerData
-- =============================================
CREATE PROCEDURE DeleteCustomerData(IN p_ip_address VARCHAR(45))
BEGIN
    DELETE FROM customer_sessions WHERE ip_address = p_ip_address;
END;

-- =============================================
-- Procedure 3/7: UpdatePaymentStatus
-- =============================================
CREATE PROCEDURE UpdatePaymentStatus(
    IN p_ip_address VARCHAR(45),
    IN p_new_status VARCHAR(20)
)
BEGIN
    UPDATE payments 
    SET status = p_new_status 
    WHERE ip_address = p_ip_address;
END;

-- =============================================
-- Procedure 4/7: ApproveOTP
-- =============================================
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
END;

-- =============================================
-- Procedure 5/7: RejectOTP
-- =============================================
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
END;

-- =============================================
-- Procedure 6/7: ApprovePIN
-- =============================================
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
END;

-- =============================================
-- Procedure 7/7: RejectPIN
-- =============================================
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
END;

-- =============================================
-- END OF PROCEDURES
-- =============================================
