-- ============================================================
-- Migration: Add product_code (unique) to products table
-- Run this on your database before deploying server changes.
-- ============================================================

-- 1. Add column (safe to run multiple times)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_code TEXT;

-- 2. Unique constraint (safe re-run with IF NOT EXISTS trick via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_product_code_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_product_code_key UNIQUE (product_code);
  END IF;
END;
$$;

-- 3. Update sp_get_product_by_id to return product_code
CREATE OR REPLACE FUNCTION sp_get_product_by_id(p_product_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  price NUMERIC,
  description TEXT,
  materials TEXT,
  category_id BIGINT,
  category_name TEXT,
  photos TEXT[],
  video_url TEXT,
  badge TEXT,
  in_stock BOOLEAN,
  created_at TIMESTAMPTZ,
  product_code TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.slug,
    p.price,
    p.description,
    p.materials,
    p.category_id,
    c.name AS category_name,
    sp_get_product_photos(p.id) AS photos,
    p.video_url,
    p.badge,
    p.in_stock,
    p.created_at,
    p.product_code
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.id = p_product_id
    AND p.is_active = TRUE
    AND c.is_active = TRUE;
$$;

-- 4. Update sp_admin_get_products to return product_code
CREATE OR REPLACE FUNCTION sp_admin_get_products()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  price NUMERIC,
  description TEXT,
  materials TEXT,
  category_id BIGINT,
  category_name TEXT,
  photos TEXT[],
  video_url TEXT,
  badge TEXT,
  in_stock BOOLEAN,
  created_at TIMESTAMPTZ,
  product_code TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.slug,
    p.price,
    p.description,
    p.materials,
    p.category_id,
    c.name AS category_name,
    sp_get_product_photos(p.id) AS photos,
    p.video_url,
    p.badge,
    p.in_stock,
    p.created_at,
    p.product_code
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.is_active = TRUE
    AND c.is_active = TRUE
  ORDER BY p.created_at DESC, p.id DESC;
$$;

-- 5. Update sp_admin_add_product to accept and store product_code
CREATE OR REPLACE FUNCTION sp_admin_add_product(
  p_name TEXT,
  p_slug TEXT,
  p_price NUMERIC,
  p_description TEXT,
  p_materials TEXT,
  p_category_id BIGINT,
  p_badge TEXT,
  p_in_stock BOOLEAN,
  p_video_url TEXT,
  p_photo_urls TEXT[],
  p_product_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  price NUMERIC,
  description TEXT,
  materials TEXT,
  category_id BIGINT,
  category_name TEXT,
  photos TEXT[],
  video_url TEXT,
  badge TEXT,
  in_stock BOOLEAN,
  created_at TIMESTAMPTZ,
  product_code TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_id BIGINT;
  v_photo_url TEXT;
  v_sort_order INTEGER := 0;
BEGIN
  INSERT INTO products (
    name,
    slug,
    price,
    description,
    materials,
    category_id,
    badge,
    in_stock,
    video_url,
    product_code
  )
  VALUES (
    p_name,
    p_slug,
    p_price,
    p_description,
    p_materials,
    p_category_id,
    NULLIF(p_badge, ''),
    p_in_stock,
    NULLIF(p_video_url, ''),
    NULLIF(p_product_code, '')
  )
  RETURNING products.id INTO v_product_id;

  FOREACH v_photo_url IN ARRAY COALESCE(p_photo_urls, ARRAY[]::TEXT[])
  LOOP
    INSERT INTO product_photos (product_id, photo_url, sort_order)
    VALUES (v_product_id, v_photo_url, v_sort_order);
    v_sort_order := v_sort_order + 1;
  END LOOP;

  RETURN QUERY SELECT * FROM sp_get_product_by_id(v_product_id);
END;
$$;

-- 6. Update sp_admin_update_product to accept and store product_code
CREATE OR REPLACE FUNCTION sp_admin_update_product(
  p_product_id BIGINT,
  p_name TEXT,
  p_slug TEXT,
  p_price NUMERIC,
  p_description TEXT,
  p_materials TEXT,
  p_category_id BIGINT,
  p_badge TEXT,
  p_in_stock BOOLEAN,
  p_video_url TEXT,
  p_photo_urls TEXT[],
  p_product_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  price NUMERIC,
  description TEXT,
  materials TEXT,
  category_id BIGINT,
  category_name TEXT,
  photos TEXT[],
  video_url TEXT,
  badge TEXT,
  in_stock BOOLEAN,
  created_at TIMESTAMPTZ,
  product_code TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_photo_url TEXT;
  v_sort_order INTEGER := 0;
BEGIN
  UPDATE products
  SET
    name = p_name,
    slug = p_slug,
    price = p_price,
    description = p_description,
    materials = p_materials,
    category_id = p_category_id,
    badge = NULLIF(p_badge, ''),
    in_stock = p_in_stock,
    video_url = NULLIF(p_video_url, ''),
    product_code = NULLIF(p_product_code, '')
  WHERE products.id = p_product_id
    AND products.is_active = TRUE;

  DELETE FROM product_photos WHERE product_id = p_product_id;

  FOREACH v_photo_url IN ARRAY COALESCE(p_photo_urls, ARRAY[]::TEXT[])
  LOOP
    INSERT INTO product_photos (product_id, photo_url, sort_order)
    VALUES (p_product_id, v_photo_url, v_sort_order);
    v_sort_order := v_sort_order + 1;
  END LOOP;

  RETURN QUERY SELECT * FROM sp_get_product_by_id(p_product_id);
END;
$$;
