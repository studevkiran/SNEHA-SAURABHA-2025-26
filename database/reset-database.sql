-- SNEHA-SAURABHA 2025-26 Database Reset Script
-- Execute this to completely reset the database

-- Drop existing tables
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS payment_logs CASCADE;

-- Create registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    mobile VARCHAR(15) NOT NULL,
    club VARCHAR(255),
    club_id INTEGER,
    registration_type VARCHAR(100) NOT NULL,
    registration_amount DECIMAL(10,2) NOT NULL,
    meal_preference VARCHAR(20) DEFAULT 'Veg',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'Cashfree',
    transaction_id VARCHAR(100),
    upi_id VARCHAR(100),
    registration_status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment logs table
CREATE TABLE payment_logs (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    registration_id VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50),
    gateway_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE SET NULL
);

-- Create indexes for faster lookups
CREATE INDEX idx_registration_id ON registrations(registration_id);
CREATE INDEX idx_transaction_id ON registrations(transaction_id);
CREATE INDEX idx_payment_status ON registrations(payment_status);
CREATE INDEX idx_registration_type ON registrations(registration_type);
CREATE INDEX idx_created_at ON registrations(created_at);
CREATE INDEX idx_order_id ON payment_logs(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to registrations table
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to payment_logs table
CREATE TRIGGER update_payment_logs_updated_at BEFORE UPDATE ON payment_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;
