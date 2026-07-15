INSERT INTO admin_settings (setting_key, setting_value)
VALUES
  ('whatsapp_number', '919104487116'),
  ('contact_email', 'hello@crochus.com'),
  ('instagram_url', 'https://instagram.com/crochus');

INSERT INTO categories (name, slug)
VALUES
  ('Jewellery', 'jewellery'),
  ('Home Decor', 'home-decor'),
  ('Bags & Totes', 'bags-totes'),
  ('Scarves & Wraps', 'scarves-wraps'),
  ('Pottery', 'pottery'),
  ('Candles', 'candles');

INSERT INTO products (name, slug, price, description, materials, category_id, badge, in_stock, video_url, created_at)
VALUES
  ('Olive Branch Earrings', 'olive-branch-earrings', 1299, 'Handcrafted sterling silver earrings inspired by the olive branch.', 'Sterling Silver 925, Oxidised Finish', 1, 'bestseller', TRUE, NULL, NOW() - INTERVAL '145 days'),
  ('Woven Jute Tote', 'woven-jute-tote', 2499, 'Hand-woven natural jute tote bag with leather handles.', 'Natural Jute, Genuine Leather Handles', 3, 'new', TRUE, NULL, NOW() - INTERVAL '120 days'),
  ('Terracotta Pot Set', 'terracotta-pot-set', 1899, 'A set of three hand-thrown terracotta pots.', 'Terracotta Clay, Natural Glaze', 5, 'featured', TRUE, NULL, NOW() - INTERVAL '132 days'),
  ('Macrame Wall Hanging', 'macrame-wall-hanging', 3299, 'Intricately knotted macrame wall art made from natural cotton rope.', '100% Natural Cotton Rope, Driftwood Rod', 2, NULL, TRUE, NULL, NOW() - INTERVAL '110 days'),
  ('Lavender Soy Candle', 'lavender-soy-candle', 799, 'Hand-poured soy wax candle infused with lavender essential oil.', 'Soy Wax, Lavender Essential Oil, Cotton Wick', 6, 'bestseller', TRUE, NULL, NOW() - INTERVAL '96 days'),
  ('Hand-block Printed Scarf', 'hand-block-printed-scarf', 1599, 'Silk scarf with traditional Indian block-print patterns.', '100% Pure Silk, Natural Dyes', 4, 'new', FALSE, NULL, NOW() - INTERVAL '88 days'),
  ('Copper Ring Trio', 'copper-ring-trio', 999, 'A set of three hand-forged copper rings with hammered texture.', 'Pure Copper, Hand-forged', 1, NULL, TRUE, NULL, NOW() - INTERVAL '150 days'),
  ('Wabi-Sabi Ceramic Bowl', 'wabi-sabi-ceramic-bowl', 1299, 'Inspired by the Japanese philosophy of finding beauty in imperfection.', 'Stoneware Clay, Matte Glaze', 5, 'featured', TRUE, NULL, NOW() - INTERVAL '101 days'),
  ('Patchwork Cushion Cover', 'patchwork-cushion-cover', 1099, 'Hand-stitched patchwork cushion cover using upcycled fabrics.', 'Upcycled Cotton & Silk Fabrics, Hidden Zip', 2, NULL, TRUE, NULL, NOW() - INTERVAL '92 days');

INSERT INTO product_photos (product_id, photo_url, sort_order)
VALUES
  ((SELECT id FROM products WHERE slug = 'olive-branch-earrings'), 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'olive-branch-earrings'), 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=900&q=80', 1),
  ((SELECT id FROM products WHERE slug = 'woven-jute-tote'), 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'woven-jute-tote'), 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80', 1),
  ((SELECT id FROM products WHERE slug = 'terracotta-pot-set'), 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'terracotta-pot-set'), 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80', 1),
  ((SELECT id FROM products WHERE slug = 'macrame-wall-hanging'), 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'macrame-wall-hanging'), 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=900&q=80', 1),
  ((SELECT id FROM products WHERE slug = 'lavender-soy-candle'), 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'lavender-soy-candle'), 'https://images.unsplash.com/photo-1563293815-ead998fcf6cc?w=900&q=80', 1),
  ((SELECT id FROM products WHERE slug = 'hand-block-printed-scarf'), 'https://images.unsplash.com/photo-1601925228606-e4a8e10d8af5?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'hand-block-printed-scarf'), 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&q=80', 1),
  ((SELECT id FROM products WHERE slug = 'copper-ring-trio'), 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'wabi-sabi-ceramic-bowl'), 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80', 0),
  ((SELECT id FROM products WHERE slug = 'patchwork-cushion-cover'), 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80', 0);
