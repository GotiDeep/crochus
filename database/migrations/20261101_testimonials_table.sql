CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_location TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION sp_get_active_testimonials()
RETURNS TABLE (
  id BIGINT,
  customer_name TEXT,
  customer_location TEXT,
  rating INTEGER,
  review_text TEXT,
  image_url TEXT,
  sort_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT id, customer_name, customer_location, rating, review_text, image_url, sort_order, is_active, created_at, updated_at
  FROM testimonials
  WHERE is_active = TRUE
  ORDER BY sort_order ASC, id ASC;
$$;

CREATE OR REPLACE FUNCTION sp_admin_get_testimonials()
RETURNS TABLE (
  id BIGINT,
  customer_name TEXT,
  customer_location TEXT,
  rating INTEGER,
  review_text TEXT,
  image_url TEXT,
  sort_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT id, customer_name, customer_location, rating, review_text, image_url, sort_order, is_active, created_at, updated_at
  FROM testimonials
  ORDER BY sort_order ASC, id ASC;
$$;
