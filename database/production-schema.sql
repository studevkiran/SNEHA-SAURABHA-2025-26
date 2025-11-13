-- =============================================
-- SNEHA SAURABHA 2025-26 - PRODUCTION SCHEMA
-- Clean, Final Database Structure
-- Date: 10 November 2025
-- =============================================

-- Drop existing tables
DROP TABLE IF EXISTS payment_logs CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;

-- =============================================
-- REGISTRATIONS TABLE (Main Table)
-- =============================================
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    
    -- Registration Identification
    registration_id VARCHAR(20) UNIQUE NOT NULL,  -- ANN21V5465 (Generated ONLY after successful payment)
    order_id VARCHAR(100) UNIQUE NOT NULL,        -- ORDER_1762789587068_191 (Transaction tracker)
    
    -- Personal Information
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(255),                            -- Optional
    
    -- Club Information
    club VARCHAR(255) NOT NULL,                    -- Club name
    club_id INTEGER NOT NULL,                      -- Club ID (1-91)
    
    -- Registration Details
    registration_type VARCHAR(100) NOT NULL,       -- Rotarian, Ann, Guest, etc.
    registration_amount DECIMAL(10,2) NOT NULL,    -- Amount paid
    meal_preference VARCHAR(20) NOT NULL,          -- Veg or Non-Veg only
    
    -- Payment Information
    payment_status VARCHAR(50) DEFAULT 'SUCCESS',  -- Only SUCCESS records here (no Pending/Failed)
    payment_method VARCHAR(50) DEFAULT 'Cashfree', -- Cashfree or Manual
    transaction_id VARCHAR(100),                   -- Cashfree transaction ID
    upi_id VARCHAR(100),                           -- UPI ID if available
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Source Tracking
    registration_source VARCHAR(50) DEFAULT 'Website',  -- 'Website' or 'Manual'
    added_by VARCHAR(100),                         -- Admin username who added (for manual entries)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PAYMENT_ATTEMPTS TABLE (Track all payment attempts)
-- =============================================
CREATE TABLE payment_attempts (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,         -- ORDER_xxx
    
    -- User Details (saved before payment)
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    club VARCHAR(255),
    club_id INTEGER,
    registration_type VARCHAR(100),
    registration_amount DECIMAL(10,2),
    meal_preference VARCHAR(20),
    
    -- Payment Status
    payment_status VARCHAR(50) DEFAULT 'Pending',  -- Pending, SUCCESS, FAILED
    payment_method VARCHAR(50) DEFAULT 'Cashfree',
    transaction_id VARCHAR(100),
    
    -- Gateway Response
    gateway_response JSONB,                        -- Store full Cashfree response
    error_message TEXT,                            -- Store error if failed
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP                         -- When payment succeeded/failed
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Registrations indexes
CREATE INDEX idx_reg_id ON registrations(registration_id);
CREATE INDEX idx_order_id ON registrations(order_id);
CREATE INDEX idx_mobile ON registrations(mobile);
CREATE INDEX idx_club ON registrations(club_id);
CREATE INDEX idx_reg_type ON registrations(registration_type);
CREATE INDEX idx_meal ON registrations(meal_preference);
CREATE INDEX idx_source ON registrations(registration_source);
CREATE INDEX idx_created ON registrations(created_at);

-- Payment attempts indexes
CREATE INDEX idx_attempt_order ON payment_attempts(order_id);
CREATE INDEX idx_attempt_mobile ON payment_attempts(mobile);
CREATE INDEX idx_attempt_status ON payment_attempts(payment_status);
CREATE INDEX idx_attempt_created ON payment_attempts(created_at);

-- =============================================
-- AUTO-UPDATE TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to registrations
CREATE TRIGGER update_registrations_updated_at 
BEFORE UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to payment_attempts
CREATE TRIGGER update_payment_attempts_updated_at 
BEFORE UPDATE ON payment_attempts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS FOR CLARITY
-- =============================================

COMMENT ON TABLE registrations IS 'Confirmed registrations - only successful payments';
COMMENT ON TABLE payment_attempts IS 'All payment attempts - success, failed, pending';

COMMENT ON COLUMN registrations.registration_id IS 'Final ID: ROT21V5465 - Generated ONLY after payment success';
COMMENT ON COLUMN registrations.order_id IS 'ORDER_xxx - Used for payment tracking';
COMMENT ON COLUMN registrations.registration_source IS 'Website or Manual - how registration was created';

COMMENT ON COLUMN payment_attempts.order_id IS 'ORDER_xxx - Same as order_id in registrations if successful';
COMMENT ON COLUMN payment_attempts.payment_status IS 'Pending = trying, SUCCESS = moved to registrations, FAILED = rejected';

-- =============================================
-- SAMPLE QUERIES
-- =============================================

-- Get all confirmed registrations
-- SELECT * FROM registrations ORDER BY created_at DESC;

-- Get failed payment attempts (for follow-up)
-- SELECT * FROM payment_attempts WHERE payment_status = 'FAILED' ORDER BY created_at DESC;

-- Get pending payments (stuck/processing)
-- SELECT * FROM payment_attempts WHERE payment_status = 'Pending' AND created_at < NOW() - INTERVAL '1 hour';

-- Statistics
-- SELECT 
--   COUNT(*) as total_registrations,
--   SUM(registration_amount) as total_revenue,
--   COUNT(CASE WHEN registration_source = 'Website' THEN 1 END) as website_count,
--   COUNT(CASE WHEN registration_source = 'Manual' THEN 1 END) as manual_count,
--   COUNT(CASE WHEN meal_preference = 'Veg' THEN 1 END) as veg_count,
--   COUNT(CASE WHEN meal_preference = 'Non-Veg' THEN 1 END) as non_veg_count
-- FROM registrations;

-- =============================================
-- DONE! Database ready for production use
-- =============================================
