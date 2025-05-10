-- Add shipping columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_location VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;
