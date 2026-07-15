import { Category, Product, Order } from './models';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Jewellery', slug: 'jewellery', product_count: 12 },
  { id: 2, name: 'Home Décor', slug: 'home-decor', product_count: 8 },
  { id: 3, name: 'Bags & Totes', slug: 'bags-totes', product_count: 6 },
  { id: 4, name: 'Scarves & Wraps', slug: 'scarves-wraps', product_count: 9 },
  { id: 5, name: 'Pottery', slug: 'pottery', product_count: 5 },
  { id: 6, name: 'Candles', slug: 'candles', product_count: 7 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Olive Branch Earrings',
    slug: 'olive-branch-earrings',
    price: 1299,
    description: 'Handcrafted sterling silver earrings inspired by the olive branch — a symbol of peace and abundance. Each pair is individually hammered and oxidised for a rich, aged finish.',
    materials: 'Sterling Silver 925, Oxidised Finish',
    category_id: 1,
    category_name: 'Jewellery',
    photos: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    ],
    badge: 'bestseller',
    in_stock: true,
    created_at: '2024-01-15'
  },
  {
    id: 2,
    name: 'Woven Jute Tote',
    slug: 'woven-jute-tote',
    price: 2499,
    description: 'Hand-woven natural jute tote bag with leather handles. Spacious enough for daily essentials, beautiful enough for every occasion.',
    materials: 'Natural Jute, Genuine Leather Handles',
    category_id: 3,
    category_name: 'Bags & Totes',
    photos: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    ],
    badge: 'new',
    in_stock: true,
    created_at: '2024-02-10'
  },
  {
    id: 3,
    name: 'Terracotta Pot Set',
    slug: 'terracotta-pot-set',
    price: 1899,
    description: 'A set of three hand-thrown terracotta pots. Perfect for herbs, succulents, or as standalone décor. Each pot has a unique texture from the potter\'s wheel.',
    materials: 'Terracotta Clay, Natural Glaze',
    category_id: 5,
    category_name: 'Pottery',
    photos: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
    ],
    badge: 'featured',
    in_stock: true,
    created_at: '2024-01-28'
  },
  {
    id: 4,
    name: 'Macramé Wall Hanging',
    slug: 'macrame-wall-hanging',
    price: 3299,
    description: 'Intricately knotted macramé wall art made from 100% natural cotton rope. A statement piece that brings warmth and texture to any wall.',
    materials: '100% Natural Cotton Rope, Driftwood Rod',
    category_id: 2,
    category_name: 'Home Décor',
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80',
    ],
    badge: null,
    in_stock: true,
    created_at: '2024-03-01'
  },
  {
    id: 5,
    name: 'Lavender Soy Candle',
    slug: 'lavender-soy-candle',
    price: 799,
    description: 'Hand-poured soy wax candle infused with pure lavender essential oil. Burns for 45+ hours. Packaged in a reusable glass jar.',
    materials: 'Soy Wax, Lavender Essential Oil, Cotton Wick',
    category_id: 6,
    category_name: 'Candles',
    photos: [
      'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&q=80',
      'https://images.unsplash.com/photo-1563293815-ead998fcf6cc?w=600&q=80',
    ],
    badge: 'bestseller',
    in_stock: true,
    created_at: '2024-02-20'
  },
  {
    id: 6,
    name: 'Hand-block Printed Scarf',
    slug: 'hand-block-printed-scarf',
    price: 1599,
    description: 'Silk scarf with traditional Indian block-print patterns. Each scarf is printed by hand, making every piece unique. The botanical motifs are inspired by Mughal garden designs.',
    materials: '100% Pure Silk, Natural Dyes',
    category_id: 4,
    category_name: 'Scarves & Wraps',
    photos: [
      'https://images.unsplash.com/photo-1601925228606-e4a8e10d8af5?w=600&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    ],
    badge: 'new',
    in_stock: false,
    created_at: '2024-03-05'
  },
  {
    id: 7,
    name: 'Copper Ring Trio',
    slug: 'copper-ring-trio',
    price: 999,
    description: 'A set of three hand-forged copper rings with hammered texture. Stackable and adjustable, these rings age beautifully over time, developing a unique patina.',
    materials: 'Pure Copper, Hand-forged',
    category_id: 1,
    category_name: 'Jewellery',
    photos: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    ],
    badge: null,
    in_stock: true,
    created_at: '2024-01-10'
  },
  {
    id: 8,
    name: 'Wabi-Sabi Ceramic Bowl',
    slug: 'wabi-sabi-ceramic-bowl',
    price: 1299,
    description: 'Inspired by the Japanese philosophy of finding beauty in imperfection. This hand-thrown ceramic bowl embraces its unique asymmetry and natural glaze variations.',
    materials: 'Stoneware Clay, Matte Glaze',
    category_id: 5,
    category_name: 'Pottery',
    photos: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
    ],
    badge: 'featured',
    in_stock: true,
    created_at: '2024-02-14'
  },
  {
    id: 9,
    name: 'Patchwork Cushion Cover',
    slug: 'patchwork-cushion-cover',
    price: 1099,
    description: 'Lovingly hand-stitched patchwork cushion cover using upcycled vintage fabrics. No two are alike — each tells its own story through fabric.',
    materials: 'Upcycled Cotton & Silk Fabrics, Hidden Zip',
    category_id: 2,
    category_name: 'Home Décor',
    photos: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    ],
    badge: null,
    in_stock: true,
    created_at: '2024-02-28'
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 1 },
      { product: MOCK_PRODUCTS[4], quantity: 2 },
    ],
    total: 2897,
    customer_name: 'Priya Sharma',
    phone: '9876543210',
    address: '42, Sunrise Society, Andheri West',
    pincode: '400053',
    note: 'Please gift wrap',
    status: 'delivered',
    created_at: '2024-03-10'
  },
  {
    id: 2,
    items: [
      { product: MOCK_PRODUCTS[2], quantity: 1 },
    ],
    total: 1899,
    customer_name: 'Arjun Patel',
    phone: '9867452310',
    address: '7, Green Park, Satellite',
    pincode: '380015',
    status: 'confirmed',
    created_at: '2024-03-14'
  },
];

export const MOCK_WHATSAPP = '919876543210';
export const MOCK_INSTAGRAM = 'https://instagram.com/crochus';
