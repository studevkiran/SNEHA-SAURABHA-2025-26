-- Add edit tracking columns to registrations table
-- Run this in Neon SQL Editor or via psql

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS edit_remarks TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_registrations_updated_at ON registrations(updated_at);

-- Comment
COMMENT ON COLUMN registrations.edit_remarks IS 'Mandatory remarks when admin edits registration data';
COMMENT ON COLUMN registrations.updated_at IS 'Timestamp of last update';
