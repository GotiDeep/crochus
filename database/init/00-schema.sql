CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile VARCHAR(15) NOT NULL,
  password_hash TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_otps (
  id BIGSERIAL PRIMARY KEY,
  purpose TEXT NOT NULL CHECK (purpose IN ('register', 'reset_password')),
  email TEXT NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  full_name TEXT,
  mobile VARCHAR(15),
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL,
  materials TEXT,
  category_id BIGINT NOT NULL REFERENCES categories(id),
  video_url TEXT,
  badge TEXT CHECK (badge IN ('new', 'bestseller', 'featured')),
  home_display TEXT NOT NULL DEFAULT 'none' CHECK (home_display IN ('none', 'hero', 'last_section')),
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_photos (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE admin_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE carts (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  note TEXT,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  primary_photo_url TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL
);

CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sp_get_home_products(p_display TEXT)
RETURNS TABLE (id BIGINT, name TEXT, slug TEXT, price NUMERIC, description TEXT, materials TEXT, category_id BIGINT, category_name TEXT, photos TEXT[], video_url TEXT, badge TEXT, in_stock BOOLEAN, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE AS $$
  SELECT ap.* FROM sp_admin_get_products() ap JOIN products p ON p.id = ap.id WHERE p.home_display = p_display ORDER BY p.updated_at DESC, p.id DESC;
$$;

CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER carts_set_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER cart_items_set_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION sp_get_product_photos(p_product_id BIGINT)
RETURNS TEXT[]
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(array_agg(photo_url ORDER BY sort_order), ARRAY[]::TEXT[])
  FROM product_photos
  WHERE product_id = p_product_id;
$$;

CREATE OR REPLACE FUNCTION sp_get_categories()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  product_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.name,
    c.slug,
    COUNT(p.id)::BIGINT AS product_count
  FROM categories c
  LEFT JOIN products p
    ON p.category_id = c.id
   AND p.is_active = TRUE
  WHERE c.is_active = TRUE
  GROUP BY c.id, c.name, c.slug
  ORDER BY c.name;
$$;

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
  created_at TIMESTAMPTZ
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
    p.created_at
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.id = p_product_id
    AND p.is_active = TRUE
    AND c.is_active = TRUE;
$$;

CREATE OR REPLACE FUNCTION sp_get_product_by_slug(p_slug TEXT)
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
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM sp_get_product_by_id((
    SELECT p.id
    FROM products p
    WHERE p.slug = p_slug
      AND p.is_active = TRUE
    LIMIT 1
  ));
$$;

CREATE OR REPLACE FUNCTION sp_get_products(
  p_category_id BIGINT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_sort TEXT DEFAULT 'newest',
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 9,
  p_featured BOOLEAN DEFAULT FALSE,
  p_exclude_id BIGINT DEFAULT NULL
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
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH filtered AS (
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
      p.created_at
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = TRUE
      AND c.is_active = TRUE
      AND (p_category_id IS NULL OR p.category_id = p_category_id)
      AND (p_exclude_id IS NULL OR p.id <> p_exclude_id)
      AND (p_featured = FALSE OR p.badge IN ('featured', 'bestseller'))
      AND (
        p_search IS NULL
        OR p_search = ''
        OR p.name ILIKE '%' || p_search || '%'
        OR p.description ILIKE '%' || p_search || '%'
        OR c.name ILIKE '%' || p_search || '%'
      )
  ),
  counted AS (
    SELECT filtered.*, COUNT(*) OVER()::BIGINT AS total_count
    FROM filtered
  )
  SELECT *
  FROM counted
  ORDER BY
    CASE WHEN p_sort = 'price_asc' THEN counted.price END ASC NULLS LAST,
    CASE WHEN p_sort = 'price_desc' THEN counted.price END DESC NULLS LAST,
    CASE WHEN p_sort = 'popular' THEN CASE WHEN counted.badge IS NOT NULL THEN 0 ELSE 1 END END ASC NULLS LAST,
    CASE WHEN p_sort = 'popular' THEN counted.created_at END DESC NULLS LAST,
    CASE WHEN p_sort IS NULL OR p_sort = 'newest' THEN counted.created_at END DESC NULLS LAST,
    counted.id DESC
  OFFSET GREATEST((COALESCE(p_page, 1) - 1) * COALESCE(p_limit, 9), 0)
  LIMIT GREATEST(COALESCE(p_limit, 9), 1);
END;
$$;

CREATE OR REPLACE FUNCTION sp_get_similar_products(
  p_category_id BIGINT,
  p_exclude_id BIGINT,
  p_limit INTEGER DEFAULT 3
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
  created_at TIMESTAMPTZ
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
    p.created_at
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.is_active = TRUE
    AND c.is_active = TRUE
    AND p.category_id = p_category_id
    AND p.id <> p_exclude_id
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT GREATEST(COALESCE(p_limit, 3), 1);
$$;

CREATE OR REPLACE FUNCTION sp_get_public_settings()
RETURNS TABLE (
  whatsapp_number TEXT,
  contact_email TEXT,
  instagram_url TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(MAX(CASE WHEN setting_key = 'whatsapp_number' THEN setting_value END), '') AS whatsapp_number,
    COALESCE(MAX(CASE WHEN setting_key = 'contact_email' THEN setting_value END), 'hello@crochus.com') AS contact_email,
    COALESCE(MAX(CASE WHEN setting_key = 'instagram_url' THEN setting_value END), 'https://instagram.com/crochus') AS instagram_url
  FROM admin_settings;
$$;

CREATE OR REPLACE FUNCTION sp_get_whatsapp_number()
RETURNS TABLE (
  whatsapp_number TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT whatsapp_number
  FROM sp_get_public_settings();
$$;

CREATE OR REPLACE FUNCTION sp_create_auth_otp(
  p_purpose TEXT,
  p_email TEXT,
  p_otp TEXT,
  p_expires_at TIMESTAMPTZ,
  p_full_name TEXT DEFAULT NULL,
  p_mobile TEXT DEFAULT NULL,
  p_password_hash TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  purpose TEXT,
  email TEXT,
  otp TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM auth_otps
  WHERE LOWER(auth_otps.email) = LOWER(p_email)
    AND auth_otps.purpose = p_purpose;

  INSERT INTO auth_otps (
    purpose,
    email,
    otp,
    expires_at,
    full_name,
    mobile,
    password_hash
  )
  VALUES (
    p_purpose,
    LOWER(p_email),
    p_otp,
    p_expires_at,
    p_full_name,
    p_mobile,
    p_password_hash
  )
  RETURNING auth_otps.id, auth_otps.purpose, auth_otps.email, auth_otps.otp, auth_otps.expires_at
  INTO id, purpose, email, otp, expires_at;

  RETURN QUERY SELECT id, purpose, email, otp, expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION sp_get_customer_auth(p_email TEXT)
RETURNS TABLE (
  id BIGINT,
  full_name TEXT,
  email TEXT,
  mobile TEXT,
  address TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.full_name,
    c.email,
    c.mobile,
    c.address,
    c.password_hash,
    c.created_at
  FROM customers c
  WHERE LOWER(c.email) = LOWER(p_email)
    AND c.is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION sp_verify_registration_otp(p_email TEXT, p_otp TEXT)
RETURNS TABLE (
  id BIGINT,
  full_name TEXT,
  email TEXT,
  mobile TEXT,
  address TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_otp auth_otps%ROWTYPE;
BEGIN
  SELECT *
  INTO v_otp
  FROM auth_otps
  WHERE LOWER(auth_otps.email) = LOWER(p_email)
    AND auth_otps.purpose = 'register'
    AND auth_otps.otp = p_otp
    AND auth_otps.consumed_at IS NULL
    AND auth_otps.expires_at >= NOW()
  ORDER BY auth_otps.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired OTP';
  END IF;

  IF EXISTS (SELECT 1 FROM customers WHERE LOWER(customers.email) = LOWER(p_email)) THEN
    RAISE EXCEPTION 'An account with this email already exists';
  END IF;

  UPDATE auth_otps
  SET consumed_at = NOW()
  WHERE auth_otps.id = v_otp.id;

  INSERT INTO customers (full_name, email, mobile, password_hash)
  VALUES (v_otp.full_name, LOWER(v_otp.email), v_otp.mobile, v_otp.password_hash)
  RETURNING customers.id, customers.full_name, customers.email, customers.mobile, customers.address, customers.created_at
  INTO id, full_name, email, mobile, address, created_at;

  RETURN QUERY SELECT id, full_name, email, mobile, address, created_at;
END;
$$;

CREATE OR REPLACE FUNCTION sp_register_customer(p_full_name TEXT, p_email TEXT, p_mobile TEXT, p_password_hash TEXT)
RETURNS TABLE (id BIGINT, full_name TEXT, email TEXT, mobile TEXT, address TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM customers WHERE LOWER(customers.email) = LOWER(p_email)) THEN
    RAISE EXCEPTION 'An account with this email already exists';
  END IF;
  INSERT INTO customers (full_name, email, mobile, password_hash)
  VALUES (p_full_name, LOWER(p_email), p_mobile, p_password_hash)
  RETURNING customers.id, customers.full_name, customers.email, customers.mobile, customers.address, customers.created_at
  INTO id, full_name, email, mobile, address, created_at;
  RETURN QUERY SELECT id, full_name, email, mobile, address, created_at;
END;
$$;

CREATE OR REPLACE FUNCTION sp_create_password_reset_otp(
  p_email TEXT,
  p_otp TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS TABLE (
  id BIGINT,
  email TEXT,
  otp TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM customers
    WHERE LOWER(customers.email) = LOWER(p_email)
      AND customers.is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Customer account not found';
  END IF;

  DELETE FROM auth_otps
  WHERE LOWER(auth_otps.email) = LOWER(p_email)
    AND auth_otps.purpose = 'reset_password';

  INSERT INTO auth_otps (purpose, email, otp, expires_at)
  VALUES ('reset_password', LOWER(p_email), p_otp, p_expires_at)
  RETURNING auth_otps.id, auth_otps.email, auth_otps.otp, auth_otps.expires_at
  INTO id, email, otp, expires_at;

  RETURN QUERY SELECT id, email, otp, expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION sp_reset_customer_password(
  p_email TEXT,
  p_otp TEXT,
  p_password_hash TEXT
)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_otp auth_otps%ROWTYPE;
BEGIN
  SELECT *
  INTO v_otp
  FROM auth_otps
  WHERE LOWER(auth_otps.email) = LOWER(p_email)
    AND auth_otps.purpose = 'reset_password'
    AND auth_otps.otp = p_otp
    AND auth_otps.consumed_at IS NULL
    AND auth_otps.expires_at >= NOW()
  ORDER BY auth_otps.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired OTP';
  END IF;

  UPDATE customers
  SET password_hash = p_password_hash
  WHERE LOWER(customers.email) = LOWER(p_email)
    AND customers.is_active = TRUE;

  UPDATE auth_otps
  SET consumed_at = NOW()
  WHERE auth_otps.id = v_otp.id;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_get_customer_profile(p_customer_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  full_name TEXT,
  email TEXT,
  mobile TEXT,
  address TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.full_name,
    c.email,
    c.mobile,
    c.address,
    c.created_at
  FROM customers c
  WHERE c.id = p_customer_id
    AND c.is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION sp_update_customer_profile(
  p_customer_id BIGINT,
  p_full_name TEXT,
  p_mobile TEXT,
  p_address TEXT
)
RETURNS TABLE (
  id BIGINT,
  full_name TEXT,
  email TEXT,
  mobile TEXT,
  address TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE customers
  SET
    full_name = p_full_name,
    mobile = p_mobile,
    address = NULLIF(p_address, '')
  WHERE customers.id = p_customer_id
    AND customers.is_active = TRUE;

  RETURN QUERY SELECT * FROM sp_get_customer_profile(p_customer_id);
END;
$$;

CREATE OR REPLACE FUNCTION sp_ensure_cart(p_customer_id BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id BIGINT;
BEGIN
  SELECT id INTO v_cart_id FROM carts WHERE customer_id = p_customer_id LIMIT 1;

  IF v_cart_id IS NULL THEN
    INSERT INTO carts (customer_id) VALUES (p_customer_id) RETURNING id INTO v_cart_id;
  END IF;

  RETURN v_cart_id;
END;
$$;

CREATE OR REPLACE FUNCTION sp_get_cart(p_customer_id BIGINT)
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
  quantity INTEGER
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
    ci.quantity
  FROM carts cart
  JOIN cart_items ci ON ci.cart_id = cart.id
  JOIN products p ON p.id = ci.product_id
  JOIN categories c ON c.id = p.category_id
  WHERE cart.customer_id = p_customer_id
    AND p.is_active = TRUE
    AND c.is_active = TRUE
  ORDER BY ci.created_at DESC, ci.id DESC;
$$;

CREATE OR REPLACE FUNCTION sp_add_cart_item(
  p_customer_id BIGINT,
  p_product_id BIGINT,
  p_quantity INTEGER
)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id BIGINT;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM products
    WHERE id = p_product_id
      AND is_active = TRUE
      AND in_stock = TRUE
  ) THEN
    RAISE EXCEPTION 'Product is unavailable';
  END IF;

  v_cart_id := sp_ensure_cart(p_customer_id);

  INSERT INTO cart_items (cart_id, product_id, quantity)
  VALUES (v_cart_id, p_product_id, p_quantity)
  ON CONFLICT (cart_id, product_id)
  DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_update_cart_item(
  p_customer_id BIGINT,
  p_product_id BIGINT,
  p_quantity INTEGER
)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id BIGINT;
BEGIN
  SELECT id INTO v_cart_id FROM carts WHERE customer_id = p_customer_id LIMIT 1;

  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found';
  END IF;

  IF p_quantity <= 0 THEN
    DELETE FROM cart_items WHERE cart_id = v_cart_id AND product_id = p_product_id;
    RETURN QUERY SELECT TRUE;
    RETURN;
  END IF;

  UPDATE cart_items
  SET quantity = p_quantity
  WHERE cart_id = v_cart_id
    AND product_id = p_product_id;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_delete_cart_item(
  p_customer_id BIGINT,
  p_product_id BIGINT
)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id BIGINT;
BEGIN
  SELECT id INTO v_cart_id FROM carts WHERE customer_id = p_customer_id LIMIT 1;

  IF v_cart_id IS NULL THEN
    RETURN QUERY SELECT TRUE;
    RETURN;
  END IF;

  DELETE FROM cart_items
  WHERE cart_id = v_cart_id
    AND product_id = p_product_id;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_clear_cart(p_customer_id BIGINT)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id BIGINT;
BEGIN
  SELECT id INTO v_cart_id FROM carts WHERE customer_id = p_customer_id LIMIT 1;

  IF v_cart_id IS NOT NULL THEN
    DELETE FROM cart_items WHERE cart_id = v_cart_id;
  END IF;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_build_order_items_json(p_order_id BIGINT)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'quantity', oi.quantity,
        'product', jsonb_build_object(
          'id', COALESCE(oi.product_id, 0),
          'name', oi.product_name,
          'slug', oi.product_slug,
          'price', oi.unit_price,
          'description', '',
          'materials', NULL,
          'category_id', 0,
          'category_name', NULL,
          'photos', CASE
            WHEN oi.primary_photo_url IS NULL THEN jsonb_build_array()
            ELSE jsonb_build_array(oi.primary_photo_url)
          END,
          'video_url', NULL,
          'badge', NULL,
          'in_stock', TRUE
        )
      )
      ORDER BY oi.id
    ),
    '[]'::JSONB
  )
  FROM order_items oi
  WHERE oi.order_id = p_order_id;
$$;

CREATE OR REPLACE FUNCTION sp_get_order_detail(
  p_order_id BIGINT,
  p_customer_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  customer_id BIGINT,
  customer_name TEXT,
  customer_email TEXT,
  phone TEXT,
  address TEXT,
  pincode TEXT,
  note TEXT,
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  items JSONB
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    o.id,
    o.customer_id,
    o.customer_name,
    o.customer_email,
    o.phone,
    o.address,
    o.pincode,
    o.note,
    o.total,
    o.status,
    o.created_at,
    sp_build_order_items_json(o.id) AS items
  FROM orders o
  WHERE o.id = p_order_id
    AND (p_customer_id IS NULL OR o.customer_id = p_customer_id)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION sp_get_order_history(p_customer_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  customer_id BIGINT,
  customer_name TEXT,
  customer_email TEXT,
  phone TEXT,
  address TEXT,
  pincode TEXT,
  note TEXT,
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  items JSONB
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    o.id,
    o.customer_id,
    o.customer_name,
    o.customer_email,
    o.phone,
    o.address,
    o.pincode,
    o.note,
    o.total,
    o.status,
    o.created_at,
    sp_build_order_items_json(o.id) AS items
  FROM orders o
  WHERE o.customer_id = p_customer_id
  ORDER BY o.created_at DESC, o.id DESC;
$$;

CREATE OR REPLACE FUNCTION sp_create_order(
  p_customer_id BIGINT,
  p_full_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_pincode TEXT,
  p_note TEXT
)
RETURNS TABLE (
  order_id BIGINT,
  total NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_cart_id BIGINT;
  v_order_id BIGINT;
  v_total NUMERIC(10, 2);
  v_customer customers%ROWTYPE;
BEGIN
  SELECT * INTO v_customer
  FROM customers
  WHERE id = p_customer_id
    AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer account not found';
  END IF;

  SELECT id INTO v_cart_id FROM carts WHERE customer_id = p_customer_id LIMIT 1;

  IF v_cart_id IS NULL OR NOT EXISTS (SELECT 1 FROM cart_items WHERE cart_id = v_cart_id) THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  INSERT INTO orders (
    customer_id,
    customer_name,
    customer_email,
    phone,
    address,
    pincode,
    note,
    total,
    status
  )
  VALUES (
    p_customer_id,
    p_full_name,
    v_customer.email,
    p_phone,
    p_address,
    p_pincode,
    NULLIF(p_note, ''),
    0,
    'new'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_slug,
    unit_price,
    primary_photo_url,
    quantity,
    line_total
  )
  SELECT
    v_order_id,
    p.id,
    p.name,
    p.slug,
    p.price,
    (SELECT pp.photo_url FROM product_photos pp WHERE pp.product_id = p.id ORDER BY pp.sort_order LIMIT 1),
    ci.quantity,
    p.price * ci.quantity
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = v_cart_id;

  SELECT COALESCE(SUM(line_total), 0) INTO v_total
  FROM order_items
  WHERE order_items.order_id = v_order_id;

  UPDATE orders
  SET total = v_total
  WHERE id = v_order_id;

  DELETE FROM cart_items WHERE cart_id = v_cart_id;

  RETURN QUERY SELECT v_order_id, v_total;
END;
$$;

CREATE OR REPLACE FUNCTION sp_create_contact_message(
  p_name TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_message TEXT
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO contact_messages (name, email, subject, message)
  VALUES (p_name, LOWER(p_email), NULLIF(p_subject, ''), p_message)
  RETURNING contact_messages.id, contact_messages.created_at INTO id, created_at;

  RETURN QUERY SELECT id, created_at;
END;
$$;

CREATE OR REPLACE FUNCTION sp_admin_dashboard_stats()
RETURNS TABLE (
  total_products BIGINT,
  total_orders BIGINT,
  total_customers BIGINT,
  total_categories BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    (SELECT COUNT(*)::BIGINT FROM products WHERE is_active = TRUE) AS total_products,
    (SELECT COUNT(*)::BIGINT FROM orders) AS total_orders,
    (SELECT COUNT(*)::BIGINT FROM customers WHERE is_active = TRUE) AS total_customers,
    (SELECT COUNT(*)::BIGINT FROM categories WHERE is_active = TRUE) AS total_categories;
$$;

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
  created_at TIMESTAMPTZ
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
    p.created_at
  FROM products p
  JOIN categories c ON c.id = p.category_id
  WHERE p.is_active = TRUE
    AND c.is_active = TRUE
  ORDER BY p.created_at DESC, p.id DESC;
$$;

CREATE OR REPLACE FUNCTION sp_admin_recent_products(p_limit INTEGER DEFAULT 5)
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
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM sp_admin_get_products()
  LIMIT GREATEST(COALESCE(p_limit, 5), 1);
$$;

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
  p_photo_urls TEXT[]
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
  created_at TIMESTAMPTZ
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
    video_url
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
    NULLIF(p_video_url, '')
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
  p_photo_urls TEXT[]
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
  created_at TIMESTAMPTZ
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
    video_url = NULLIF(p_video_url, '')
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

CREATE OR REPLACE FUNCTION sp_admin_delete_product(p_product_id BIGINT)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Preserve order history, but remove the deleted product from active carts.
  DELETE FROM cart_items WHERE product_id = p_product_id;
  UPDATE order_items SET product_id = NULL WHERE product_id = p_product_id;
  DELETE FROM products WHERE id = p_product_id;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_admin_recent_orders(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  id BIGINT,
  customer_id BIGINT,
  customer_name TEXT,
  customer_email TEXT,
  phone TEXT,
  address TEXT,
  pincode TEXT,
  note TEXT,
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  items JSONB
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    o.id,
    o.customer_id,
    o.customer_name,
    o.customer_email,
    o.phone,
    o.address,
    o.pincode,
    o.note,
    o.total,
    o.status,
    o.created_at,
    sp_build_order_items_json(o.id) AS items
  FROM orders o
  ORDER BY o.created_at DESC, o.id DESC
  LIMIT GREATEST(COALESCE(p_limit, 5), 1);
$$;

CREATE OR REPLACE FUNCTION sp_admin_get_orders(p_status TEXT DEFAULT NULL)
RETURNS TABLE (
  id BIGINT,
  customer_id BIGINT,
  customer_name TEXT,
  customer_email TEXT,
  phone TEXT,
  address TEXT,
  pincode TEXT,
  note TEXT,
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  items JSONB
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    o.id,
    o.customer_id,
    o.customer_name,
    o.customer_email,
    o.phone,
    o.address,
    o.pincode,
    o.note,
    o.total,
    o.status,
    o.created_at,
    sp_build_order_items_json(o.id) AS items
  FROM orders o
  WHERE p_status IS NULL OR p_status = '' OR o.status = p_status
  ORDER BY o.created_at DESC, o.id DESC;
$$;

CREATE OR REPLACE FUNCTION sp_admin_update_order_status(
  p_order_id BIGINT,
  p_status TEXT
)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders
  SET status = p_status
  WHERE id = p_order_id;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_admin_add_category(
  p_name TEXT,
  p_slug TEXT
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  product_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO categories (name, slug)
  VALUES (p_name, p_slug)
  RETURNING categories.id, categories.name, categories.slug INTO id, name, slug;

  product_count := 0;
  RETURN QUERY SELECT id, name, slug, product_count;
END;
$$;

CREATE OR REPLACE FUNCTION sp_admin_update_category(
  p_category_id BIGINT,
  p_name TEXT,
  p_slug TEXT
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  slug TEXT,
  product_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE categories
  SET
    name = p_name,
    slug = p_slug
  WHERE categories.id = p_category_id
    AND categories.is_active = TRUE;

  RETURN QUERY
  SELECT category.id, category.name, category.slug, category.product_count
  FROM sp_get_categories() AS category
  WHERE category.id = p_category_id;
END;
$$;

CREATE OR REPLACE FUNCTION sp_admin_delete_category(p_category_id BIGINT)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM products
    WHERE category_id = p_category_id
      AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Cannot delete a category that still has active products';
  END IF;

  UPDATE categories
  SET is_active = FALSE
  WHERE id = p_category_id;

  RETURN QUERY SELECT TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_admin_update_whatsapp(p_number TEXT)
RETURNS TABLE (
  whatsapp_number TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO admin_settings (setting_key, setting_value)
  VALUES ('whatsapp_number', p_number)
  ON CONFLICT (setting_key)
  DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

  RETURN QUERY
  SELECT setting_value
  FROM admin_settings
  WHERE setting_key = 'whatsapp_number';
END;
$$;

CREATE OR REPLACE FUNCTION sp_admin_get_smtp_settings()
RETURNS TABLE (smtp_host TEXT, smtp_port INTEGER, smtp_secure BOOLEAN, smtp_user TEXT, smtp_from TEXT, contact_receiver_email TEXT, password_configured BOOLEAN)
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(MAX(CASE WHEN setting_key = 'smtp_host' THEN setting_value END), ''), COALESCE(MAX(CASE WHEN setting_key = 'smtp_port' THEN setting_value END)::INTEGER, 587), COALESCE(MAX(CASE WHEN setting_key = 'smtp_secure' THEN setting_value END)::BOOLEAN, FALSE), COALESCE(MAX(CASE WHEN setting_key = 'smtp_user' THEN setting_value END), ''), COALESCE(MAX(CASE WHEN setting_key = 'smtp_from' THEN setting_value END), ''), COALESCE(MAX(CASE WHEN setting_key = 'contact_receiver_email' THEN setting_value END), ''), COALESCE(BOOL_OR(setting_key = 'smtp_password_encrypted'), FALSE) FROM admin_settings;
$$;

CREATE OR REPLACE FUNCTION sp_get_smtp_settings()
RETURNS TABLE (smtp_host TEXT, smtp_port INTEGER, smtp_secure BOOLEAN, smtp_user TEXT, smtp_from TEXT, contact_receiver_email TEXT, smtp_password_encrypted TEXT)
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(MAX(CASE WHEN setting_key = 'smtp_host' THEN setting_value END), ''), COALESCE(MAX(CASE WHEN setting_key = 'smtp_port' THEN setting_value END)::INTEGER, 587), COALESCE(MAX(CASE WHEN setting_key = 'smtp_secure' THEN setting_value END)::BOOLEAN, FALSE), COALESCE(MAX(CASE WHEN setting_key = 'smtp_user' THEN setting_value END), ''), COALESCE(MAX(CASE WHEN setting_key = 'smtp_from' THEN setting_value END), ''), COALESCE(MAX(CASE WHEN setting_key = 'contact_receiver_email' THEN setting_value END), ''), COALESCE(MAX(CASE WHEN setting_key = 'smtp_password_encrypted' THEN setting_value END), '') FROM admin_settings;
$$;

CREATE OR REPLACE FUNCTION sp_admin_update_smtp_settings(p_host TEXT, p_port INTEGER, p_secure BOOLEAN, p_user TEXT, p_from TEXT, p_receiver TEXT, p_encrypted_password TEXT DEFAULT NULL)
RETURNS TABLE (smtp_host TEXT, smtp_port INTEGER, smtp_secure BOOLEAN, smtp_user TEXT, smtp_from TEXT, contact_receiver_email TEXT, password_configured BOOLEAN)
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO admin_settings (setting_key, setting_value) VALUES ('smtp_host', p_host), ('smtp_port', p_port::TEXT), ('smtp_secure', p_secure::TEXT), ('smtp_user', p_user), ('smtp_from', p_from), ('contact_receiver_email', p_receiver) ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
  IF p_encrypted_password IS NOT NULL THEN INSERT INTO admin_settings (setting_key, setting_value) VALUES ('smtp_password_encrypted', p_encrypted_password) ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW(); END IF;
  RETURN QUERY SELECT * FROM sp_admin_get_smtp_settings();
END;
;
