/**
 * Add T-Shirt Size Column to Registrations
 * Run this in Neon SQL Editor
 */

-- Add tshirt_size column
ALTER TABLE registrations 
ADD COLUMN tshirt_size VARCHAR(10);

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'registrations' 
AND column_name = 'tshirt_size';

-- Update existing records to NULL (or set a default if needed)
-- Records without size will show NULL

-- To delete ₹1 test entries, use:
-- DELETE FROM registrations WHERE registration_amount = 1;
