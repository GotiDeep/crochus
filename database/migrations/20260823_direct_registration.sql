CREATE OR REPLACE FUNCTION sp_register_customer(p_full_name TEXT, p_email TEXT, p_mobile TEXT, p_password_hash TEXT)
RETURNS TABLE (id BIGINT, full_name TEXT, email TEXT, mobile TEXT, address TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM customers WHERE LOWER(customers.email) = LOWER(p_email)) THEN RAISE EXCEPTION 'An account with this email already exists'; END IF;
  INSERT INTO customers (full_name, email, mobile, password_hash) VALUES (p_full_name, LOWER(p_email), p_mobile, p_password_hash)
  RETURNING customers.id, customers.full_name, customers.email, customers.mobile, customers.address, customers.created_at INTO id, full_name, email, mobile, address, created_at;
  RETURN QUERY SELECT id, full_name, email, mobile, address, created_at;
END;
$$;
