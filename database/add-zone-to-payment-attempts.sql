-- Add zone column to payment_attempts table
-- Run this if zone column doesn't exist

ALTER TABLE payment_attempts 
ADD COLUMN IF NOT EXISTS zone VARCHAR(50);

COMMENT ON COLUMN payment_attempts.zone IS 'Zone classification for reporting (set from club mapping)';

-- Set default for existing records
UPDATE payment_attempts 
SET zone = 'Unmapped' 
WHERE zone IS NULL;
