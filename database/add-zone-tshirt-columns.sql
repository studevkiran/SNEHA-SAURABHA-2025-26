-- Add zone and tshirt_size columns to registrations table

-- Add zone column
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS zone VARCHAR(50);

-- Add tshirt_size column
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS tshirt_size VARCHAR(10);

-- Update existing records with default zone (Unmapped) if null
UPDATE registrations 
SET zone = 'Unmapped' 
WHERE zone IS NULL;

-- Update existing records with default tshirt_size (N/A) if null
UPDATE registrations 
SET tshirt_size = 'N/A' 
WHERE tshirt_size IS NULL;

-- Add comments
COMMENT ON COLUMN registrations.zone IS 'Zone mapping based on club (Zone 1-8 or Unmapped)';
COMMENT ON COLUMN registrations.tshirt_size IS 'T-Shirt size: XS, S, M, L, XL, XXL, XXXL, or N/A';
