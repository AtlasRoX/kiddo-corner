-- Add default_rating and review_count columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS default_rating INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
