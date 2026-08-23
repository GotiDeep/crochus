ALTER TABLE products ADD COLUMN IF NOT EXISTS home_display TEXT NOT NULL DEFAULT 'none' CHECK (home_display IN ('none', 'hero', 'last_section'));

CREATE OR REPLACE FUNCTION sp_get_home_products(p_display TEXT)
RETURNS TABLE (id BIGINT, name TEXT, slug TEXT, price NUMERIC, description TEXT, materials TEXT, category_id BIGINT, category_name TEXT, photos TEXT[], video_url TEXT, badge TEXT, in_stock BOOLEAN, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE AS $$
  SELECT ap.* FROM sp_admin_get_products() ap JOIN products p ON p.id = ap.id WHERE p.home_display = p_display ORDER BY p.updated_at DESC, p.id DESC;
$$;
