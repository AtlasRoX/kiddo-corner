-- Create shipping_costs table if it doesn't exist
CREATE TABLE IF NOT EXISTS shipping_costs (
  id SERIAL PRIMARY KEY,
  location_key VARCHAR(50) NOT NULL UNIQUE,
  location_name VARCHAR(100) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default shipping costs if they don't exist
INSERT INTO shipping_costs (location_key, location_name, cost, display_order)
VALUES 
  ('inside_dhaka', 'Inside Dhaka', 80, 1),
  ('outside_dhaka', 'Outside Dhaka', 130, 2)
ON CONFLICT (location_key) DO NOTHING;

-- Add shipping columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_location VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;
