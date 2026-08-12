-- Apply this once to databases created before this change.
CREATE OR REPLACE FUNCTION sp_admin_delete_product(p_product_id BIGINT)
RETURNS TABLE (success BOOLEAN)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  DELETE FROM cart_items WHERE product_id = p_product_id;
  UPDATE order_items SET product_id = NULL WHERE product_id = p_product_id;
  DELETE FROM products WHERE id = p_product_id;

  RETURN QUERY SELECT TRUE;
END;
$$;
