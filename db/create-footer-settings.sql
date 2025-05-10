-- Create footer_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS footer_settings (
  id SERIAL PRIMARY KEY,
  section_name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default footer sections if they don't exist
INSERT INTO footer_settings (section_name, title, content, display_order, is_active)
SELECT 'about', 'About Us', '{"text": "Kiddo Corner provides high-quality baby products that bring joy and comfort to your baby\'s life."}', 1, true
WHERE NOT EXISTS (SELECT 1 FROM footer_settings WHERE section_name = 'about');

INSERT INTO footer_settings (section_name, title, content, display_order, is_active)
SELECT 'contact', 'Contact Us', '{"address": "123 Baby Street, Dhaka, Bangladesh", "email": "contact@kiddocorner.com", "phone": "+880 1234 567890"}', 2, true
WHERE NOT EXISTS (SELECT 1 FROM footer_settings WHERE section_name = 'contact');

INSERT INTO footer_settings (section_name, title, content, display_order, is_active)
SELECT 'links', 'Quick Links', '{"links": [{"title": "Home", "url": "/"}, {"title": "Products", "url": "/products"}, {"title": "About", "url": "/about"}, {"title": "Contact", "url": "/contact"}]}', 3, true
WHERE NOT EXISTS (SELECT 1 FROM footer_settings WHERE section_name = 'links');

INSERT INTO footer_settings (section_name, title, content, display_order, is_active)
SELECT 'social', 'Follow Us', '{"links": [{"title": "Facebook", "url": "https://facebook.com/kiddocorner", "icon": "facebook"}, {"title": "Instagram", "url": "https://instagram.com/kiddocorner", "icon": "instagram"}, {"title": "Twitter", "url": "https://twitter.com/kiddocorner", "icon": "twitter"}]}', 4, true
WHERE NOT EXISTS (SELECT 1 FROM footer_settings WHERE section_name = 'social');

INSERT INTO footer_settings (section_name, title, content, display_order, is_active)
SELECT 'newsletter', 'Newsletter', '{"text": "Subscribe to get special offers and updates!", "placeholder": "Your email", "button_text": "Subscribe"}', 5, true
WHERE NOT EXISTS (SELECT 1 FROM footer_settings WHERE section_name = 'newsletter');

INSERT INTO footer_settings (section_name, title, content, display_order, is_active)
SELECT 'copyright', 'Copyright', '{"text": "© 2023 Kiddo Corner. All rights reserved."}', 6, true
WHERE NOT EXISTS (SELECT 1 FROM footer_settings WHERE section_name = 'copyright');
