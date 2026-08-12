--
-- PostgreSQL database dump
--

\restrict ufiTCeO42MPoyFiaeMgQvlOz9CTxHvEJB1qcbPoSMODnl7h9Lw3asRNdybErqJR

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-08-09 19:36:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 240 (class 1255 OID 60218)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- TOC entry 247 (class 1255 OID 60219)
-- Name: sp_add_cart_item(bigint, bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_add_cart_item(p_customer_id bigint, p_product_id bigint, p_quantity integer) RETURNS TABLE(success boolean)
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


ALTER FUNCTION public.sp_add_cart_item(p_customer_id bigint, p_product_id bigint, p_quantity integer) OWNER TO postgres;

--
-- TOC entry 248 (class 1255 OID 60220)
-- Name: sp_admin_add_category(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_add_category(p_name text, p_slug text) RETURNS TABLE(id bigint, name text, slug text, product_count bigint)
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


ALTER FUNCTION public.sp_admin_add_category(p_name text, p_slug text) OWNER TO postgres;

--
-- TOC entry 263 (class 1255 OID 60221)
-- Name: sp_admin_add_product(text, text, numeric, text, text, bigint, text, boolean, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_add_product(p_name text, p_slug text, p_price numeric, p_description text, p_materials text, p_category_id bigint, p_badge text, p_in_stock boolean, p_video_url text, p_photo_urls text[]) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone)
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


ALTER FUNCTION public.sp_admin_add_product(p_name text, p_slug text, p_price numeric, p_description text, p_materials text, p_category_id bigint, p_badge text, p_in_stock boolean, p_video_url text, p_photo_urls text[]) OWNER TO postgres;

--
-- TOC entry 264 (class 1255 OID 60222)
-- Name: sp_admin_dashboard_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_dashboard_stats() RETURNS TABLE(total_products bigint, total_orders bigint, total_customers bigint, total_categories bigint)
    LANGUAGE sql STABLE
    AS $$
  SELECT
    (SELECT COUNT(*)::BIGINT FROM products WHERE is_active = TRUE) AS total_products,
    (SELECT COUNT(*)::BIGINT FROM orders) AS total_orders,
    (SELECT COUNT(*)::BIGINT FROM customers WHERE is_active = TRUE) AS total_customers,
    (SELECT COUNT(*)::BIGINT FROM categories WHERE is_active = TRUE) AS total_categories;
$$;


ALTER FUNCTION public.sp_admin_dashboard_stats() OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 60223)
-- Name: sp_admin_delete_category(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_delete_category(p_category_id bigint) RETURNS TABLE(success boolean)
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


ALTER FUNCTION public.sp_admin_delete_category(p_category_id bigint) OWNER TO postgres;

--
-- TOC entry 266 (class 1255 OID 60224)
-- Name: sp_admin_delete_product(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_delete_product(p_product_id bigint) RETURNS TABLE(success boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE products
  SET is_active = FALSE
  WHERE id = p_product_id;

  RETURN QUERY SELECT TRUE;
END;
$$;


ALTER FUNCTION public.sp_admin_delete_product(p_product_id bigint) OWNER TO postgres;

--
-- TOC entry 267 (class 1255 OID 60225)
-- Name: sp_admin_get_orders(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_get_orders(p_status text DEFAULT NULL::text) RETURNS TABLE(id bigint, customer_id bigint, customer_name text, customer_email text, phone text, address text, pincode text, note text, total numeric, status text, created_at timestamp with time zone, items jsonb)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_admin_get_orders(p_status text) OWNER TO postgres;

--
-- TOC entry 268 (class 1255 OID 60226)
-- Name: sp_admin_get_products(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_get_products() RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_admin_get_products() OWNER TO postgres;

--
-- TOC entry 269 (class 1255 OID 60227)
-- Name: sp_admin_recent_orders(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_recent_orders(p_limit integer DEFAULT 5) RETURNS TABLE(id bigint, customer_id bigint, customer_name text, customer_email text, phone text, address text, pincode text, note text, total numeric, status text, created_at timestamp with time zone, items jsonb)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_admin_recent_orders(p_limit integer) OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 60228)
-- Name: sp_admin_recent_products(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_recent_products(p_limit integer DEFAULT 5) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone)
    LANGUAGE sql STABLE
    AS $$
  SELECT *
  FROM sp_admin_get_products()
  LIMIT GREATEST(COALESCE(p_limit, 5), 1);
$$;


ALTER FUNCTION public.sp_admin_recent_products(p_limit integer) OWNER TO postgres;

--
-- TOC entry 243 (class 1255 OID 60229)
-- Name: sp_admin_update_category(bigint, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_update_category(p_category_id bigint, p_name text, p_slug text) RETURNS TABLE(id bigint, name text, slug text, product_count bigint)
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


ALTER FUNCTION public.sp_admin_update_category(p_category_id bigint, p_name text, p_slug text) OWNER TO postgres;

--
-- TOC entry 244 (class 1255 OID 60230)
-- Name: sp_admin_update_order_status(bigint, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_update_order_status(p_order_id bigint, p_status text) RETURNS TABLE(success boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE orders
  SET status = p_status
  WHERE id = p_order_id;

  RETURN QUERY SELECT TRUE;
END;
$$;


ALTER FUNCTION public.sp_admin_update_order_status(p_order_id bigint, p_status text) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 60231)
-- Name: sp_admin_update_product(bigint, text, text, numeric, text, text, bigint, text, boolean, text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_update_product(p_product_id bigint, p_name text, p_slug text, p_price numeric, p_description text, p_materials text, p_category_id bigint, p_badge text, p_in_stock boolean, p_video_url text, p_photo_urls text[]) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone)
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


ALTER FUNCTION public.sp_admin_update_product(p_product_id bigint, p_name text, p_slug text, p_price numeric, p_description text, p_materials text, p_category_id bigint, p_badge text, p_in_stock boolean, p_video_url text, p_photo_urls text[]) OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 60232)
-- Name: sp_admin_update_whatsapp(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_admin_update_whatsapp(p_number text) RETURNS TABLE(whatsapp_number text)
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


ALTER FUNCTION public.sp_admin_update_whatsapp(p_number text) OWNER TO postgres;

--
-- TOC entry 272 (class 1255 OID 60233)
-- Name: sp_build_order_items_json(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_build_order_items_json(p_order_id bigint) RETURNS jsonb
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_build_order_items_json(p_order_id bigint) OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 60234)
-- Name: sp_clear_cart(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_clear_cart(p_customer_id bigint) RETURNS TABLE(success boolean)
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


ALTER FUNCTION public.sp_clear_cart(p_customer_id bigint) OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 60235)
-- Name: sp_create_auth_otp(text, text, text, timestamp with time zone, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_create_auth_otp(p_purpose text, p_email text, p_otp text, p_expires_at timestamp with time zone, p_full_name text DEFAULT NULL::text, p_mobile text DEFAULT NULL::text, p_password_hash text DEFAULT NULL::text) RETURNS TABLE(id bigint, purpose text, email text, otp text, expires_at timestamp with time zone)
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


ALTER FUNCTION public.sp_create_auth_otp(p_purpose text, p_email text, p_otp text, p_expires_at timestamp with time zone, p_full_name text, p_mobile text, p_password_hash text) OWNER TO postgres;

--
-- TOC entry 275 (class 1255 OID 60236)
-- Name: sp_create_contact_message(text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_create_contact_message(p_name text, p_email text, p_subject text, p_message text) RETURNS TABLE(id bigint, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO contact_messages (name, email, subject, message)
  VALUES (p_name, LOWER(p_email), NULLIF(p_subject, ''), p_message)
  RETURNING contact_messages.id, contact_messages.created_at INTO id, created_at;

  RETURN QUERY SELECT id, created_at;
END;
$$;


ALTER FUNCTION public.sp_create_contact_message(p_name text, p_email text, p_subject text, p_message text) OWNER TO postgres;

--
-- TOC entry 276 (class 1255 OID 60237)
-- Name: sp_create_order(bigint, text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_create_order(p_customer_id bigint, p_full_name text, p_phone text, p_address text, p_pincode text, p_note text) RETURNS TABLE(order_id bigint, total numeric)
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


ALTER FUNCTION public.sp_create_order(p_customer_id bigint, p_full_name text, p_phone text, p_address text, p_pincode text, p_note text) OWNER TO postgres;

--
-- TOC entry 277 (class 1255 OID 60238)
-- Name: sp_create_password_reset_otp(text, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_create_password_reset_otp(p_email text, p_otp text, p_expires_at timestamp with time zone) RETURNS TABLE(id bigint, email text, otp text, expires_at timestamp with time zone)
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


ALTER FUNCTION public.sp_create_password_reset_otp(p_email text, p_otp text, p_expires_at timestamp with time zone) OWNER TO postgres;

--
-- TOC entry 245 (class 1255 OID 60239)
-- Name: sp_delete_cart_item(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_delete_cart_item(p_customer_id bigint, p_product_id bigint) RETURNS TABLE(success boolean)
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


ALTER FUNCTION public.sp_delete_cart_item(p_customer_id bigint, p_product_id bigint) OWNER TO postgres;

--
-- TOC entry 246 (class 1255 OID 60240)
-- Name: sp_ensure_cart(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_ensure_cart(p_customer_id bigint) RETURNS bigint
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


ALTER FUNCTION public.sp_ensure_cart(p_customer_id bigint) OWNER TO postgres;

--
-- TOC entry 254 (class 1255 OID 60241)
-- Name: sp_get_cart(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_cart(p_customer_id bigint) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone, quantity integer)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_cart(p_customer_id bigint) OWNER TO postgres;

--
-- TOC entry 261 (class 1255 OID 60242)
-- Name: sp_get_categories(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_categories() RETURNS TABLE(id bigint, name text, slug text, product_count bigint)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_categories() OWNER TO postgres;

--
-- TOC entry 241 (class 1255 OID 60243)
-- Name: sp_get_customer_auth(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_customer_auth(p_email text) RETURNS TABLE(id bigint, full_name text, email text, mobile text, address text, password_hash text, created_at timestamp with time zone)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_customer_auth(p_email text) OWNER TO postgres;

--
-- TOC entry 249 (class 1255 OID 60244)
-- Name: sp_get_customer_profile(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_customer_profile(p_customer_id bigint) RETURNS TABLE(id bigint, full_name text, email text, mobile text, address text, created_at timestamp with time zone)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_customer_profile(p_customer_id bigint) OWNER TO postgres;

--
-- TOC entry 278 (class 1255 OID 60245)
-- Name: sp_get_order_detail(bigint, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_order_detail(p_order_id bigint, p_customer_id bigint DEFAULT NULL::bigint) RETURNS TABLE(id bigint, customer_id bigint, customer_name text, customer_email text, phone text, address text, pincode text, note text, total numeric, status text, created_at timestamp with time zone, items jsonb)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_order_detail(p_order_id bigint, p_customer_id bigint) OWNER TO postgres;

--
-- TOC entry 279 (class 1255 OID 60246)
-- Name: sp_get_order_history(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_order_history(p_customer_id bigint) RETURNS TABLE(id bigint, customer_id bigint, customer_name text, customer_email text, phone text, address text, pincode text, note text, total numeric, status text, created_at timestamp with time zone, items jsonb)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_order_history(p_customer_id bigint) OWNER TO postgres;

--
-- TOC entry 280 (class 1255 OID 60247)
-- Name: sp_get_product_by_id(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_product_by_id(p_product_id bigint) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_product_by_id(p_product_id bigint) OWNER TO postgres;

--
-- TOC entry 281 (class 1255 OID 60248)
-- Name: sp_get_product_by_slug(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_product_by_slug(p_slug text) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_product_by_slug(p_slug text) OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 60249)
-- Name: sp_get_product_photos(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_product_photos(p_product_id bigint) RETURNS text[]
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(array_agg(photo_url ORDER BY sort_order), ARRAY[]::TEXT[])
  FROM product_photos
  WHERE product_id = p_product_id;
$$;


ALTER FUNCTION public.sp_get_product_photos(p_product_id bigint) OWNER TO postgres;

--
-- TOC entry 283 (class 1255 OID 60250)
-- Name: sp_get_products(bigint, text, text, integer, integer, boolean, bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_products(p_category_id bigint DEFAULT NULL::bigint, p_search text DEFAULT NULL::text, p_sort text DEFAULT 'newest'::text, p_page integer DEFAULT 1, p_limit integer DEFAULT 9, p_featured boolean DEFAULT false, p_exclude_id bigint DEFAULT NULL::bigint) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone, total_count bigint)
    LANGUAGE plpgsql STABLE
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


ALTER FUNCTION public.sp_get_products(p_category_id bigint, p_search text, p_sort text, p_page integer, p_limit integer, p_featured boolean, p_exclude_id bigint) OWNER TO postgres;

--
-- TOC entry 284 (class 1255 OID 60251)
-- Name: sp_get_public_settings(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_public_settings() RETURNS TABLE(whatsapp_number text, contact_email text, instagram_url text)
    LANGUAGE sql STABLE
    AS $$
  SELECT
    COALESCE(MAX(CASE WHEN setting_key = 'whatsapp_number' THEN setting_value END), '') AS whatsapp_number,
    COALESCE(MAX(CASE WHEN setting_key = 'contact_email' THEN setting_value END), 'hello@crochus.com') AS contact_email,
    COALESCE(MAX(CASE WHEN setting_key = 'instagram_url' THEN setting_value END), 'https://instagram.com/crochus') AS instagram_url
  FROM admin_settings;
$$;


ALTER FUNCTION public.sp_get_public_settings() OWNER TO postgres;

--
-- TOC entry 285 (class 1255 OID 60252)
-- Name: sp_get_similar_products(bigint, bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_similar_products(p_category_id bigint, p_exclude_id bigint, p_limit integer DEFAULT 3) RETURNS TABLE(id bigint, name text, slug text, price numeric, description text, materials text, category_id bigint, category_name text, photos text[], video_url text, badge text, in_stock boolean, created_at timestamp with time zone)
    LANGUAGE sql STABLE
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


ALTER FUNCTION public.sp_get_similar_products(p_category_id bigint, p_exclude_id bigint, p_limit integer) OWNER TO postgres;

--
-- TOC entry 286 (class 1255 OID 60253)
-- Name: sp_get_whatsapp_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_get_whatsapp_number() RETURNS TABLE(whatsapp_number text)
    LANGUAGE sql STABLE
    AS $$
  SELECT whatsapp_number
  FROM sp_get_public_settings();
$$;


ALTER FUNCTION public.sp_get_whatsapp_number() OWNER TO postgres;

--
-- TOC entry 287 (class 1255 OID 60254)
-- Name: sp_reset_customer_password(text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_reset_customer_password(p_email text, p_otp text, p_password_hash text) RETURNS TABLE(success boolean)
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


ALTER FUNCTION public.sp_reset_customer_password(p_email text, p_otp text, p_password_hash text) OWNER TO postgres;

--
-- TOC entry 288 (class 1255 OID 60255)
-- Name: sp_update_cart_item(bigint, bigint, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_update_cart_item(p_customer_id bigint, p_product_id bigint, p_quantity integer) RETURNS TABLE(success boolean)
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


ALTER FUNCTION public.sp_update_cart_item(p_customer_id bigint, p_product_id bigint, p_quantity integer) OWNER TO postgres;

--
-- TOC entry 289 (class 1255 OID 60256)
-- Name: sp_update_customer_profile(bigint, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_update_customer_profile(p_customer_id bigint, p_full_name text, p_mobile text, p_address text) RETURNS TABLE(id bigint, full_name text, email text, mobile text, address text, created_at timestamp with time zone)
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


ALTER FUNCTION public.sp_update_customer_profile(p_customer_id bigint, p_full_name text, p_mobile text, p_address text) OWNER TO postgres;

--
-- TOC entry 290 (class 1255 OID 60257)
-- Name: sp_verify_registration_otp(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_verify_registration_otp(p_email text, p_otp text) RETURNS TABLE(id bigint, full_name text, email text, mobile text, address text, created_at timestamp with time zone)
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


ALTER FUNCTION public.sp_verify_registration_otp(p_email text, p_otp text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 60258)
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_settings (
    setting_key text NOT NULL,
    setting_value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_settings OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 60267)
-- Name: auth_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_otps (
    id bigint NOT NULL,
    purpose text NOT NULL,
    email text NOT NULL,
    otp character varying(6) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    full_name text,
    mobile character varying(15),
    password_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auth_otps_purpose_check CHECK ((purpose = ANY (ARRAY['register'::text, 'reset_password'::text])))
);


ALTER TABLE public.auth_otps OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 60280)
-- Name: auth_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_otps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_otps_id_seq OWNER TO postgres;

--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 221
-- Name: auth_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_otps_id_seq OWNED BY public.auth_otps.id;


--
-- TOC entry 222 (class 1259 OID 60281)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id bigint NOT NULL,
    cart_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 60293)
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO postgres;

--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 223
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- TOC entry 224 (class 1259 OID 60294)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 60303)
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_id_seq OWNER TO postgres;

--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 225
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- TOC entry 226 (class 1259 OID 60304)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 60318)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 227
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 228 (class 1259 OID 60319)
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_messages (
    id bigint NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contact_messages OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 60330)
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_id_seq OWNER TO postgres;

--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 229
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- TOC entry 230 (class 1259 OID 60331)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    mobile character varying(15) NOT NULL,
    password_hash text NOT NULL,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 60347)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 231
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 232 (class 1259 OID 60348)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    product_id bigint,
    product_name text NOT NULL,
    product_slug text NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    primary_photo_url text,
    quantity integer NOT NULL,
    line_total numeric(10,2) NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 60361)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 233
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 234 (class 1259 OID 60362)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    customer_name text NOT NULL,
    customer_email text,
    phone text NOT NULL,
    address text NOT NULL,
    pincode text NOT NULL,
    note text,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['new'::text, 'confirmed'::text, 'delivered'::text])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 60382)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 235
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 236 (class 1259 OID 60383)
-- Name: product_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_photos (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    photo_url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_photos OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 60393)
-- Name: product_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_photos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_photos_id_seq OWNER TO postgres;

--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 237
-- Name: product_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_photos_id_seq OWNED BY public.product_photos.id;


--
-- TOC entry 238 (class 1259 OID 60394)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    price numeric(10,2) NOT NULL,
    description text NOT NULL,
    materials text,
    category_id bigint NOT NULL,
    video_url text,
    badge text,
    in_stock boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_badge_check CHECK ((badge = ANY (ARRAY['new'::text, 'bestseller'::text, 'featured'::text]))),
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 60415)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 239
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 4900 (class 2604 OID 60416)
-- Name: auth_otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_otps ALTER COLUMN id SET DEFAULT nextval('public.auth_otps_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 60417)
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 60418)
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 60419)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 60420)
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 60421)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 60422)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 60423)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 60424)
-- Name: product_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_photos ALTER COLUMN id SET DEFAULT nextval('public.product_photos_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 60425)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 5132 (class 0 OID 60258)
-- Dependencies: 219
-- Data for Name: admin_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_settings (setting_key, setting_value, updated_at) FROM stdin;
contact_email	hello@crochus.com	2026-08-07 20:38:40.399877+05:30
instagram_url	https://instagram.com/crochus	2026-08-07 20:38:40.399877+05:30
whatsapp_number	918200502248	2026-08-08 20:42:17.451113+05:30
\.


--
-- TOC entry 5133 (class 0 OID 60267)
-- Dependencies: 220
-- Data for Name: auth_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_otps (id, purpose, email, otp, expires_at, consumed_at, full_name, mobile, password_hash, created_at) FROM stdin;
1	register	deepgoti12@gmail.com	911047	2026-08-07 22:03:28.227+05:30	2026-08-07 21:53:38.348729+05:30	Deep	9925100986	$2a$10$HwlY9IFmFfUQO2LrdFk3Xu0HeZW2h1n29Z7WVPJD7xNcR/b87eOWm	2026-08-07 21:53:28.233247+05:30
\.


--
-- TOC entry 5135 (class 0 OID 60281)
-- Dependencies: 222
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, product_id, quantity, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5137 (class 0 OID 60294)
-- Dependencies: 224
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, customer_id, created_at, updated_at) FROM stdin;
1	1	2026-08-08 20:39:43.83513+05:30	2026-08-08 20:39:43.83513+05:30
\.


--
-- TOC entry 5139 (class 0 OID 60304)
-- Dependencies: 226
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, is_active, created_at, updated_at) FROM stdin;
1	Jewellery	jewellery	t	2026-08-07 20:38:40.41139+05:30	2026-08-07 20:38:40.41139+05:30
6	Candles	candles	t	2026-08-07 20:38:40.41139+05:30	2026-08-07 20:38:40.41139+05:30
7	Handmade Purse	handmade-purse	t	2026-08-08 22:12:07.550558+05:30	2026-08-08 22:12:07.550558+05:30
3	Bags & Totes	bags-totes	f	2026-08-07 20:38:40.41139+05:30	2026-08-08 23:21:28.088328+05:30
4	Scarves & Wraps	scarves-wraps	f	2026-08-07 20:38:40.41139+05:30	2026-08-08 23:21:41.061644+05:30
2	Home Decor	home-decor	f	2026-08-07 20:38:40.41139+05:30	2026-08-08 23:21:51.437604+05:30
8	Booquets	booquets	t	2026-08-08 23:21:17.05086+05:30	2026-08-09 16:49:35.672163+05:30
5	Children Wear	children-wear	t	2026-08-07 20:38:40.41139+05:30	2026-08-09 16:53:01.729946+05:30
\.


--
-- TOC entry 5141 (class 0 OID 60319)
-- Dependencies: 228
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_messages (id, name, email, subject, message, created_at) FROM stdin;
\.


--
-- TOC entry 5143 (class 0 OID 60331)
-- Dependencies: 230
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, full_name, email, mobile, password_hash, address, is_active, created_at, updated_at) FROM stdin;
1	Deep	deepgoti12@gmail.com	9925100986	$2a$10$HwlY9IFmFfUQO2LrdFk3Xu0HeZW2h1n29Z7WVPJD7xNcR/b87eOWm	\N	t	2026-08-07 21:53:38.348729+05:30	2026-08-07 21:53:38.348729+05:30
2	Crochus Admin	admin@crochus.com	9999999999	$2a$10$mv2sffOME0ovbRH9akTJJueFCKBIWRwXIBsXid4.etWy92wHmUH0.	\N	t	2026-08-08 21:43:38.436217+05:30	2026-08-08 21:43:38.436217+05:30
\.


--
-- TOC entry 5145 (class 0 OID 60348)
-- Dependencies: 232
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, product_name, product_slug, unit_price, primary_photo_url, quantity, line_total) FROM stdin;
1	1	5	Lavender Soy Candle	lavender-soy-candle	799.00	https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=900&q=80	1	799.00
\.


--
-- TOC entry 5147 (class 0 OID 60362)
-- Dependencies: 234
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_id, customer_name, customer_email, phone, address, pincode, note, total, status, created_at, updated_at) FROM stdin;
1	1	Deep	deepgoti12@gmail.com	9925100986	asjsuxsuxsxus	112244	\N	799.00	new	2026-08-08 20:40:26.15805+05:30	2026-08-08 20:41:28.214489+05:30
\.


--
-- TOC entry 5149 (class 0 OID 60383)
-- Dependencies: 236
-- Data for Name: product_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_photos (id, product_id, photo_url, sort_order) FROM stdin;
1	1	https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80	0
2	1	https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=80	1
3	2	https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80	0
4	2	https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80	1
5	3	https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80	0
6	3	https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80	1
7	4	https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80	0
8	4	https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=900&q=80	1
9	5	https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=900&q=80	0
10	5	https://images.unsplash.com/photo-1563293815-ead998fcf6cc?w=900&q=80	1
11	6	https://images.unsplash.com/photo-1601925228606-e4a8e10d8af5?w=900&q=80	0
12	6	https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&q=80	1
15	9	https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80	0
16	10	http://localhost:3000/uploads/1786207462799-f729f88adaa23608fa45f4367de082c3-jpg.jpeg	0
18	11	http://localhost:3000/uploads/1786211756311-IMG_0286.jpeg	0
21	12	http://localhost:3000/uploads/1786274206279-IMG-20250616-WA0027-jpg.jpeg	0
23	8	http://localhost:3000/uploads/1786274644285-28441---Copy-jpg.jpeg	0
24	13	http://localhost:3000/uploads/1786274558899-55375---Copy-jpg.jpeg	0
25	7	https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80	0
\.


--
-- TOC entry 5151 (class 0 OID 60394)
-- Dependencies: 238
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, price, description, materials, category_id, video_url, badge, in_stock, is_active, created_at, updated_at) FROM stdin;
1	Olive Branch Earrings	olive-branch-earrings	1299.00	Handcrafted sterling silver earrings inspired by the olive branch.	Sterling Silver 925, Oxidised Finish	1	\N	bestseller	t	t	2026-03-15 20:38:40.438581+05:30	2026-08-07 20:38:40.438581+05:30
6	Hand-block Printed Scarf	hand-block-printed-scarf	1599.00	Silk scarf with traditional Indian block-print patterns.	100% Pure Silk, Natural Dyes	4	\N	new	f	f	2026-05-11 20:38:40.438581+05:30	2026-08-08 20:38:00.85358+05:30
9	Patchwork Cushion Cover	patchwork-cushion-cover	1099.00	Hand-stitched patchwork cushion cover using upcycled fabrics.	Upcycled Cotton & Silk Fabrics, Hidden Zip	2	\N	\N	t	f	2026-05-07 20:38:40.438581+05:30	2026-08-08 20:38:10.678554+05:30
10	Yellow Crochet Purse	yellow-crochet-purse	450.00	Beautiful Crochet Purse	Dhaga	7	\N	featured	t	t	2026-08-08 22:14:22.962269+05:30	2026-08-08 22:14:22.962269+05:30
3	Terracotta Pot Set	terracotta-pot-set	1899.00	A set of three hand-thrown terracotta pots.	Terracotta Clay, Natural Glaze	5	\N	featured	t	f	2026-03-28 20:38:40.438581+05:30	2026-08-08 22:17:00.132189+05:30
4	Macrame Wall Hanging	macrame-wall-hanging	3299.00	Intricately knotted macrame wall art made from natural cotton rope.	100% Natural Cotton Rope, Driftwood Rod	2	\N	\N	t	f	2026-04-19 20:38:40.438581+05:30	2026-08-08 22:17:20.160743+05:30
2	Woven Jute Tote	woven-jute-tote	2499.00	Hand-woven natural jute tote bag with leather handles.	Natural Jute, Genuine Leather Handles	3	\N	new	t	f	2026-04-09 20:38:40.438581+05:30	2026-08-08 23:09:13.598618+05:30
11	Key Chain	key-chain	100.00	AmaZing Key Chain	\N	8	\N	bestseller	t	f	2026-08-08 23:23:35.427246+05:30	2026-08-08 23:26:14.898473+05:30
12	Booquet	booquet	100.00	Amazing Booquet	\N	8	\N	featured	t	t	2026-08-08 23:27:00.819365+05:30	2026-08-09 16:48:49.987963+05:30
5	Lavender Soy Candle	lavender-soy-candle	799.00	Hand-poured soy wax candle infused with lavender essential oil.	Soy Wax, Lavender Essential Oil, Cotton Wick	6	\N	bestseller	t	f	2026-05-03 20:38:40.438581+05:30	2026-08-09 16:50:03.125205+05:30
8	Yellow Jacket	yellow-jacket	1299.00	Inspired by the Japanese philosophy of finding beauty in imperfection.	Stoneware Clay, Matte Glaze	5	\N	featured	t	t	2026-04-28 20:38:40.438581+05:30	2026-08-09 16:54:04.384299+05:30
13	Children Cloth Wear	children-cloth-wear	500.00	Beautiful Small Girl Dress	\N	5	\N	bestseller	t	t	2026-08-09 16:52:38.9827+05:30	2026-08-09 16:54:27.288737+05:30
7	Copper Ring Trio	copper-ring-trio	999.00	A set of three hand-forged copper rings with hammered texture.	Pure Copper, Hand-forged	1	\N	featured	t	t	2026-03-10 20:38:40.438581+05:30	2026-08-09 16:54:42.812153+05:30
\.


--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 221
-- Name: auth_otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_otps_id_seq', 1, true);


--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 223
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 1, true);


--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 225
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carts_id_seq', 1, true);


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 227
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 229
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 231
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 2, true);


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 233
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, true);


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 235
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, true);


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 237
-- Name: product_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_photos_id_seq', 25, true);


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 239
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 13, true);


--
-- TOC entry 4938 (class 2606 OID 60427)
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (setting_key);


--
-- TOC entry 4940 (class 2606 OID 60429)
-- Name: auth_otps auth_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_otps
    ADD CONSTRAINT auth_otps_pkey PRIMARY KEY (id);


--
-- TOC entry 4942 (class 2606 OID 60431)
-- Name: cart_items cart_items_cart_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_product_id_key UNIQUE (cart_id, product_id);


--
-- TOC entry 4944 (class 2606 OID 60433)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 60435)
-- Name: carts carts_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_key UNIQUE (customer_id);


--
-- TOC entry 4948 (class 2606 OID 60437)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 60439)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 4952 (class 2606 OID 60441)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 60443)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 4956 (class 2606 OID 60445)
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 60447)
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- TOC entry 4960 (class 2606 OID 60449)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 60451)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 60453)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 60455)
-- Name: product_photos product_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_photos
    ADD CONSTRAINT product_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 60457)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 60459)
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- TOC entry 4979 (class 2620 OID 60460)
-- Name: cart_items cart_items_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cart_items_set_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4980 (class 2620 OID 60461)
-- Name: carts carts_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER carts_set_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4981 (class 2620 OID 60462)
-- Name: categories categories_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4982 (class 2620 OID 60463)
-- Name: customers customers_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4983 (class 2620 OID 60464)
-- Name: orders orders_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4984 (class 2620 OID 60465)
-- Name: products products_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4971 (class 2606 OID 60466)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- TOC entry 4972 (class 2606 OID 60471)
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4973 (class 2606 OID 60476)
-- Name: carts carts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4974 (class 2606 OID 60481)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4975 (class 2606 OID 60486)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4976 (class 2606 OID 60491)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4977 (class 2606 OID 60496)
-- Name: product_photos product_photos_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_photos
    ADD CONSTRAINT product_photos_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4978 (class 2606 OID 60501)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


-- Completed on 2026-08-09 19:37:00

--
-- PostgreSQL database dump complete
--

\unrestrict ufiTCeO42MPoyFiaeMgQvlOz9CTxHvEJB1qcbPoSMODnl7h9Lw3asRNdybErqJR

