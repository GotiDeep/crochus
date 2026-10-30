const path = require('path');
const { pool } = require(path.resolve(__dirname, '../../server/src/config/db'));

async function runMigration() {
  console.log('Running banners migration...');

  const query = `
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

    -- Seed initial 3 banners if empty
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM banners LIMIT 1) THEN
        INSERT INTO banners (name, title, subtitle, image_url, link_url, button_text, display_on, sort_order, is_active)
        VALUES
          (
            'Handmade Crochet Collection',
            'Little Things, Handmade with Love',
            'Explore handcrafted crochet bags, flowers, rakhis & adorable gifts.',
            'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=1600&q=80',
            '/shop',
            'Explore Collection',
            'App, Web',
            1,
            TRUE
          ),
          (
            'Artisan Crochet Bouquets',
            'Everlasting Floral Bouquets',
            'Made petal by petal with premium yarn to bring warmth to your home.',
            'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1600&q=80',
            '/shop',
            'View Bouquets',
            'App, Web',
            2,
            TRUE
          ),
          (
            'Chic Bags & Accessories',
            'Lovable Handmade Accessories',
            'Thoughtfully crafted crochet purses, tote bags, and personalized keychains.',
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1600&q=80',
            '/shop',
            'Shop Bags',
            'App, Web',
            3,
            TRUE
          );
      END IF;
    END $$;
  `;

  try {
    await pool.query(query);
    console.log('Banners table and functions created successfully!');
    const check = await pool.query('SELECT id, name, display_on, sort_order, is_active FROM banners');
    console.log('Current banners in DB:', check.rows);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
