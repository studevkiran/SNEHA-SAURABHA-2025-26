-- =============================================
-- MANUAL REGISTRATIONS TABLE (Temporary/Staging)
-- Store 680 manually added registrations separately
-- Can be reviewed, updated, and merged later
-- =============================================

-- Create separate table for manual registrations
CREATE TABLE IF NOT EXISTS manual_registrations (
    id SERIAL PRIMARY KEY,
    
    -- Registration Identification
    registration_id VARCHAR(20) UNIQUE NOT NULL,  -- 2026RTY0001
    
    -- Personal Information
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15),                            -- Can be updated later
    email VARCHAR(255),                            -- Can be updated later
    
    -- Club Information
    club VARCHAR(255) NOT NULL,
    club_id INTEGER,                               -- Lookup from clubs
    
    -- Registration Details
    registration_type VARCHAR(100) NOT NULL,
    registration_amount DECIMAL(10,2) NOT NULL,
    meal_preference VARCHAR(20) DEFAULT 'Veg',    -- Can be updated later
    tshirt_size VARCHAR(10),                      -- Can be updated later
    
    -- Payment Information
    registration_date DATE NOT NULL,               -- Original registration date
    payment_status VARCHAR(50) DEFAULT 'SUCCESS',
    
    -- Status Tracking
    is_verified BOOLEAN DEFAULT FALSE,             -- Mark as verified after review
    is_merged BOOLEAN DEFAULT FALSE,               -- Track if merged to main table
    needs_contact_update BOOLEAN DEFAULT TRUE,     -- Flag for missing contact info
    
    -- Notes
    notes TEXT,                                    -- Any special notes
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_reg_id ON manual_registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_manual_club ON manual_registrations(club_id);
CREATE INDEX IF NOT EXISTS idx_manual_status ON manual_registrations(is_verified, is_merged);
CREATE INDEX IF NOT EXISTS idx_manual_needs_update ON manual_registrations(needs_contact_update);

-- Add comment
COMMENT ON TABLE manual_registrations IS 'Temporary staging table for 680 manually added registrations. Review and update before merging to main registrations table.';

-- View to show registrations that need contact info update
CREATE OR REPLACE VIEW manual_regs_need_update AS
SELECT 
    registration_id,
    name,
    club,
    registration_type,
    registration_amount,
    CASE 
        WHEN mobile IS NULL OR mobile = '' OR mobile = '0000000000' OR mobile = 'N/A' THEN '❌ Missing'
        ELSE '✅ ' || mobile
    END as mobile_status,
    CASE 
        WHEN email IS NULL OR email = '' OR email = 'noreply@sneha2026.in' OR email = 'N/A' THEN '❌ Missing'
        ELSE '✅ ' || email
    END as email_status,
    is_verified,
    registration_date
FROM manual_registrations
WHERE needs_contact_update = TRUE
ORDER BY 
    CASE registration_type
        WHEN 'Patron Sponsor' THEN 1
        WHEN 'Platinum Sponsor' THEN 2
        WHEN 'Gold Sponsor' THEN 3
        WHEN 'Silver Sponsor' THEN 4
        ELSE 5
    END,
    registration_date;

-- Summary view
CREATE OR REPLACE VIEW manual_regs_summary AS
SELECT 
    registration_type,
    COUNT(*) as count,
    SUM(registration_amount) as total_revenue,
    COUNT(CASE WHEN is_verified THEN 1 END) as verified_count,
    COUNT(CASE WHEN is_merged THEN 1 END) as merged_count,
    COUNT(CASE WHEN needs_contact_update THEN 1 END) as needs_update_count
FROM manual_registrations
GROUP BY registration_type
ORDER BY total_revenue DESC;

COMMENT ON VIEW manual_regs_need_update IS 'Shows all manual registrations that need contact information updates';
COMMENT ON VIEW manual_regs_summary IS 'Summary statistics for manual registrations';

-- Function to update contact info
CREATE OR REPLACE FUNCTION update_manual_contact(
    p_registration_id VARCHAR(20),
    p_mobile VARCHAR(15),
    p_email VARCHAR(255),
    p_meal VARCHAR(20) DEFAULT NULL,
    p_tshirt VARCHAR(10) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE manual_registrations
    SET 
        mobile = COALESCE(p_mobile, mobile),
        email = COALESCE(p_email, email),
        meal_preference = COALESCE(p_meal, meal_preference),
        tshirt_size = COALESCE(p_tshirt, tshirt_size),
        needs_contact_update = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE registration_id = p_registration_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_manual_contact IS 'Helper function to update contact information for manual registrations';

-- Function to verify a registration
CREATE OR REPLACE FUNCTION verify_manual_registration(p_registration_id VARCHAR(20))
RETURNS VOID AS $$
BEGIN
    UPDATE manual_registrations
    SET 
        is_verified = TRUE,
        updated_at = CURRENT_TIMESTAMP
    WHERE registration_id = p_registration_id;
END;
$$ LANGUAGE plpgsql;

-- Function to merge verified registrations to main table
CREATE OR REPLACE FUNCTION merge_manual_to_main()
RETURNS TABLE(
    merged_count INTEGER,
    failed_count INTEGER,
    error_details TEXT[]
) AS $$
DECLARE
    v_merged INTEGER := 0;
    v_failed INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_record RECORD;
BEGIN
    -- Loop through verified and not-yet-merged records
    FOR v_record IN 
        SELECT * FROM manual_registrations 
        WHERE is_verified = TRUE AND is_merged = FALSE
    LOOP
        BEGIN
            -- Insert into main registrations table
            INSERT INTO registrations (
                registration_id,
                order_id,
                name,
                mobile,
                email,
                club,
                club_id,
                registration_type,
                registration_amount,
                meal_preference,
                tshirt_size,
                payment_status,
                payment_method,
                transaction_id,
                payment_date,
                registration_source,
                added_by,
                created_at,
                updated_at
            ) VALUES (
                v_record.registration_id,
                'MANUAL_REG_' || v_record.registration_id,
                v_record.name,
                COALESCE(v_record.mobile, 'N/A'),
                COALESCE(v_record.email, 'N/A'),
                v_record.club,
                v_record.club_id,
                v_record.registration_type,
                v_record.registration_amount,
                v_record.meal_preference,
                v_record.tshirt_size,
                'SUCCESS',
                'Manual',
                v_record.registration_id,
                v_record.registration_date,
                'Manual',
                'Admin Import',
                v_record.registration_date,
                CURRENT_TIMESTAMP
            );
            
            -- Mark as merged
            UPDATE manual_registrations
            SET is_merged = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE registration_id = v_record.registration_id;
            
            v_merged := v_merged + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_failed := v_failed + 1;
            v_errors := array_append(v_errors, v_record.registration_id || ': ' || SQLERRM);
        END;
    END LOOP;
    
    RETURN QUERY SELECT v_merged, v_failed, v_errors;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION merge_manual_to_main IS 'Merges verified manual registrations to main registrations table. Returns count of merged and failed records.';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Manual registrations table created successfully!';
    RAISE NOTICE '📋 Table: manual_registrations';
    RAISE NOTICE '👁️  Views: manual_regs_need_update, manual_regs_summary';
    RAISE NOTICE '🔧 Functions: update_manual_contact(), verify_manual_registration(), merge_manual_to_main()';
END $$;
