-- ============================================================================
-- WISHLIST MIGRATION SCRIPT
-- ============================================================================
-- Note: Put all future database changes (tables, functions, etc.) for wishlists 
-- or similar features in this file so they are easy to apply to the live project.
-- ============================================================================

CREATE TABLE IF NOT EXISTS wishlists (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- Note: In future, if you create stored procedures for wishlist, they can be added below:
-- CREATE OR REPLACE FUNCTION sp_add_wishlist_item(...) ...
