-- Create founder_story table
CREATE TABLE IF NOT EXISTS founder_story (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Thankyou Crochus Family',
  story_body TEXT NOT NULL,
  sub_message TEXT,
  founder_name VARCHAR(255) DEFAULT 'CROCHUS - Founder',
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default initial row if table is empty
INSERT INTO founder_story (title, story_body, sub_message, founder_name, image_url, is_active)
SELECT 
  'Thankyou Crochus Family',
  'We started this journey with a simple mission: to bring you the finest products with exceptional service. Every item we offer is carefully crafted by us by our own hands with lots of love.',
  'Thank you for being part of our story.',
  'CROCHUS - Founder',
  'assets/founder.jpg',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM founder_story);
