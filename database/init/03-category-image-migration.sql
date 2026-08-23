-- Migration for adding image_url to categories.
-- PostgreSQL cannot change a function's OUT/RETURN TABLE shape in-place,
-- so remove the previous signatures before recreating them.
BEGIN;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

DROP FUNCTION IF EXISTS public.sp_admin_update_category(BIGINT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.sp_admin_add_category(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.sp_get_categories();

CREATE OR REPLACE FUNCTION sp_get_categories()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  image_url TEXT,
  product_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.name,
    c.slug,
    c.image_url,
    COUNT(p.id)::BIGINT AS product_count
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
  WHERE c.is_active = TRUE
  GROUP BY c.id, c.name, c.slug, c.image_url
  ORDER BY c.name ASC;
$$;

CREATE OR REPLACE FUNCTION sp_admin_add_category(
  p_name TEXT,
  p_slug TEXT,
  p_image_url TEXT
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  image_url TEXT,
  product_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO categories (name, slug, image_url)
  VALUES (p_name, p_slug, p_image_url)
  RETURNING categories.id, categories.name, categories.slug, categories.image_url INTO id, name, slug, image_url;

  product_count := 0;
  RETURN QUERY SELECT id, name, slug, image_url, product_count;
END;
$$;

COMMIT;

CREATE OR REPLACE FUNCTION sp_admin_update_category(
  p_category_id BIGINT,
  p_name TEXT,
  p_slug TEXT,
  p_image_url TEXT
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  image_url TEXT,
  product_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE categories
  SET
    name = p_name,
    slug = p_slug,
    image_url = p_image_url,
    updated_at = NOW()
  WHERE categories.id = p_category_id
    AND categories.is_active = TRUE;

  RETURN QUERY
  SELECT * FROM sp_get_categories() AS category
  WHERE category.id = p_category_id;
END;
$$;
