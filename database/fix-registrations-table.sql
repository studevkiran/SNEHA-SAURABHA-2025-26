-- Fix registrations table for Neon database
-- Add missing columns needed for payment flow

-- Drop existing table if you want fresh start (CAUTION: deletes all data!)
-- DROP TABLE IF EXISTS registrations;

-- Or add missing column to existing table:
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS registration_id VARCHAR(20) UNIQUE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS mobile VARCHAR(15);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS club_name VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS registration_type VARCHAR(50);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meal_preference VARCHAR(20);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registration_id ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_mobile ON registrations(mobile);
CREATE INDEX IF NOT EXISTS idx_payment_status ON registrations(payment_status);
