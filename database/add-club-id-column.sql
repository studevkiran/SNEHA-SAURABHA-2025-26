-- Add club_id column to registrations table
-- Run this in your Neon database SQL editor

ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS club_id INTEGER DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN registrations.club_id IS 'Rotary club ID (1-91) for registration identification';

-- Update existing records to set club_id to 0 for old data
UPDATE registrations 
SET club_id = 0 
WHERE club_id IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'registrations' AND column_name = 'club_id';
