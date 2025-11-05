-- SNEHA-SAURABHA 2025-26 Conference Registration Database Schema
-- Vercel Postgres / PostgreSQL
-- Created: November 5, 2025

-- ========================================
-- 1. REGISTRATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(20) UNIQUE NOT NULL,  -- SS00001, SS00002, etc.
    
    -- Personal Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    club_name VARCHAR(255) NOT NULL,
    
    -- Registration Details
    registration_type VARCHAR(50) NOT NULL,  -- rotarian, rotarian-spouse, etc.
    amount DECIMAL(10, 2) NOT NULL,
    meal_preference VARCHAR(20) NOT NULL,    -- Veg, Non-Veg, Jain
    
    -- Payment Information
    payment_status VARCHAR(20) DEFAULT 'Pending',  -- Pending, Paid, Failed
    payment_method VARCHAR(50),                     -- Cashfree, Manual, etc.
    transaction_id VARCHAR(255),
    upi_id VARCHAR(255),
    payment_date TIMESTAMP,
    
    -- Verification
    verification_status VARCHAR(20) DEFAULT 'Pending',  -- Pending, Verified
    verified_by VARCHAR(100),
    verified_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for faster queries
    INDEX idx_registration_id (registration_id),
    INDEX idx_email (email),
    INDEX idx_mobile (mobile),
    INDEX idx_payment_status (payment_status),
    INDEX idx_registration_type (registration_type),
    INDEX idx_created_at (created_at)
);

-- ========================================
-- 2. PAYMENT_LOGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(20) NOT NULL,
    
    -- Cashfree Payment Details
    order_id VARCHAR(255) UNIQUE NOT NULL,
    payment_session_id VARCHAR(255),
    cf_payment_id VARCHAR(255),
    
    -- Payment Info
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(50),
    payment_method VARCHAR(100),
    
    -- Response Data
    payment_message TEXT,
    bank_reference VARCHAR(255),
    payment_time TIMESTAMP,
    
    -- Webhook Data
    webhook_received BOOLEAN DEFAULT FALSE,
    webhook_signature VARCHAR(500),
    webhook_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_order_id (order_id),
    INDEX idx_registration_id_payment (registration_id),
    INDEX idx_payment_status (payment_status)
);

-- ========================================
-- 3. ADMIN_USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Hashed password (bcrypt)
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',     -- admin, superadmin
    
    -- Activity Tracking
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username)
);

-- ========================================
-- 4. ACTIVITY_LOGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(100),
    action VARCHAR(100) NOT NULL,         -- login, create, update, delete, export
    entity_type VARCHAR(50),              -- registration, payment, admin
    entity_id VARCHAR(100),
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_admin_username (admin_username),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- ========================================
-- 5. STATISTICS TABLE (Optional - for caching)
-- ========================================
CREATE TABLE IF NOT EXISTS statistics (
    id SERIAL PRIMARY KEY,
    stat_key VARCHAR(100) UNIQUE NOT NULL,  -- total_registrations, total_revenue, etc.
    stat_value JSONB,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_stat_key (stat_key)
);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for registrations table
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payment_logs table
CREATE TRIGGER update_payment_logs_updated_at
    BEFORE UPDATE ON payment_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for admin_users table
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (username, password_hash, email, role)
VALUES ('admin', '$2b$10$rBV2MKlQbHU9E.xVJL5kPO0qV3VZf8YhYz8JxFwQ3LKpX9eKqZzSu', 'admin@sneha-saurabha.com', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reg_status_type 
    ON registrations(payment_status, registration_type);

CREATE INDEX IF NOT EXISTS idx_reg_date_status 
    ON registrations(created_at DESC, payment_status);

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- View for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_registrations,
    SUM(amount) as total_revenue,
    COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN payment_status = 'Pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN payment_status = 'Failed' THEN 1 END) as failed_count,
    COUNT(CASE WHEN meal_preference = 'Veg' THEN 1 END) as veg_count,
    COUNT(CASE WHEN meal_preference = 'Non-Veg' THEN 1 END) as non_veg_count,
    COUNT(CASE WHEN meal_preference = 'Jain' THEN 1 END) as jain_count
FROM registrations;

-- View for registration type breakdown
CREATE OR REPLACE VIEW registration_type_stats AS
SELECT 
    registration_type,
    COUNT(*) as count,
    SUM(amount) as revenue,
    COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count
FROM registrations
GROUP BY registration_type
ORDER BY count DESC;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE registrations IS 'Main table storing all conference registrations';
COMMENT ON TABLE payment_logs IS 'Cashfree payment transaction logs';
COMMENT ON TABLE admin_users IS 'Admin dashboard users';
COMMENT ON TABLE activity_logs IS 'Audit trail for admin actions';

-- ========================================
-- GRANTS (Adjust based on your user)
-- ========================================

-- Vercel Postgres automatically handles permissions
-- No additional grants needed for Vercel deployment
