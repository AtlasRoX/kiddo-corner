-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'cod' or 'mobile_banking'
  details JSONB DEFAULT '{}',
  instructions TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create system_messages table
CREATE TABLE IF NOT EXISTS system_messages (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_note TEXT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  variation_id INTEGER REFERENCES product_variations(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method_id INTEGER REFERENCES payment_methods(id),
  transaction_id VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'declined', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default payment methods
INSERT INTO payment_methods (name, type, details, instructions, display_order)
VALUES 
('Cash on Delivery', 'cod', '{}', 'Pay when you receive your order.', 1),
('Bkash', 'mobile_banking', '{"account_number": "+8801966570914", "account_type": "personal"}', 'Bkash Number: +8801966570914 (Send Money)\nIf you''ve sent the payment, please enter your Transaction ID below.', 2),
('Nagad', 'mobile_banking', '{"account_number": "+8801966570914", "account_type": "personal"}', 'Nagad Number: +8801966570914 (Send Money)\nIf you''ve sent the payment, please enter your Transaction ID below.', 3);

-- Insert default system messages
INSERT INTO system_messages (key, content)
VALUES 
('checkout_success_cod', '✅ Thank you for choosing us! Our representative will contact you shortly to confirm your order.'),
('checkout_success_mobile_banking', '✅ Thank you for choosing us! Our representative will contact you shortly to verify your payment.');
