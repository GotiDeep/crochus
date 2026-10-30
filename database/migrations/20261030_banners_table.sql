CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '/shop',
  button_text TEXT DEFAULT 'Shop Now',
  display_on TEXT NOT NULL DEFAULT 'App, Web',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION sp_get_active_banners()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  button_text TEXT,
  display_on TEXT,
  sort_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT id, name, title, subtitle, image_url, link_url, button_text, display_on, sort_order, is_active, created_at, updated_at
  FROM banners
  WHERE is_active = TRUE
  ORDER BY sort_order ASC, id ASC;
$$;

CREATE OR REPLACE FUNCTION sp_admin_get_banners()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  button_text TEXT,
  display_on TEXT,
  sort_order INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT id, name, title, subtitle, image_url, link_url, button_text, display_on, sort_order, is_active, created_at, updated_at
  FROM banners
  ORDER BY sort_order ASC, id ASC;
$$;
