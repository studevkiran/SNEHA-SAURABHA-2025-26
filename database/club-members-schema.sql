-- Club Members Table for Quick Registration
-- This table stores pre-registered club members for auto-fill

CREATE TABLE IF NOT EXISTS club_members (
  id SERIAL PRIMARY KEY,
  club_id VARCHAR(10),
  club_name VARCHAR(255) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(20),
  member_type VARCHAR(50) DEFAULT 'Rotarian', -- 'Rotarian', 'Ann', 'Annet'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for fast lookups
  CONSTRAINT unique_member UNIQUE (club_name, member_name, email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_club_members_club_name ON club_members(club_name);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_email ON club_members(email);

-- Link to clubs table if club_id exists
ALTER TABLE club_members 
  ADD CONSTRAINT fk_club_members_club 
  FOREIGN KEY (club_id) 
  REFERENCES clubs(club_id) 
  ON DELETE SET NULL
  ON UPDATE CASCADE;

COMMENT ON TABLE club_members IS 'Pre-registered club members for quick registration feature';
