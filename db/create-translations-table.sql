-- Create translations table if it doesn't exist
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  english TEXT NOT NULL,
  bangla TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default translations if the table is empty
INSERT INTO translations (key, english, bangla)
SELECT 'home.title', 'Adorable Products for Your Little One', 'আপনার ছোট্ট শিশুর জন্য সুন্দর পণ্য'
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'home.title');

INSERT INTO translations (key, english, bangla)
SELECT 'home.description', 'Discover our collection of high-quality baby products that bring joy and comfort to your baby''s life.', 'আপনার শিশুর জীবনে আনন্দ এবং আরাম আনে এমন উচ্চ-মানের শিশু পণ্যের আমাদের সংগ্রহ আবিষ্কার করুন।'
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'home.description');

INSERT INTO translations (key, english, bangla)
SELECT 'footer.subscribe', 'Subscribe to get special offers and cute updates!', 'বিশেষ অফার এবং সুন্দর আপডেট পেতে সাবস্ক্রাইব করুন!'
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'footer.subscribe');

INSERT INTO translations (key, english, bangla)
SELECT 'checkout.shippingLocation', 'Shipping Location', 'শিপিং অবস্থান'
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'checkout.shippingLocation');

INSERT INTO translations (key, english, bangla)
SELECT 'checkout.shippingNote', 'Shipping cost will be added to your total', 'আপনার মোট খরচের সাথে শিপিং খরচ যোগ করা হবে'
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'checkout.shippingNote');

INSERT INTO translations (key, english, bangla)
SELECT 'admin.shipping', 'Shipping Costs', 'শিপিং খরচ'
WHERE NOT EXISTS (SELECT 1 FROM translations WHERE key = 'admin.shipping');
