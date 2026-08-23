const bcrypt = require('bcryptjs');
const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { runFunction, pool } = require('../config/db');
const { signAdminToken } = require('../lib/auth');
const slugify = require('../lib/slugify');
const { mapCategoryRow, mapDashboardStats, mapOrderRow, mapProductRow } = require('../lib/mappers');
const { uploadImageFiles, uploadVideoFile, deleteCloudinaryAssets } = require('../services/mediaService');
const { encrypt } = require('../lib/secureSettings');
const { sendTestEmail } = require('../services/mailService');
const env = require('../config/env');

const ADMIN_EMAIL = 'admin@crochus.com';

function parseStringArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function parseBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
}

function parseHomeDisplay(value) {
  const display = String(value || 'none');
  return ['none', 'hero', 'last_section'].includes(display) ? display : 'none';
}

async function setHomeDisplay(productId, display) {
  const limit = display === 'hero' ? 3 : display === 'last_section' ? 4 : 0;
  if (limit) {
    const result = await pool.query('SELECT COUNT(*)::INTEGER AS count FROM products WHERE home_display = $1 AND id <> $2', [display, productId]);
    if (result.rows[0].count >= limit) throw new ApiError(409, `${display === 'hero' ? 'Hero section' : 'Home last section'} can display only ${limit} products`);
  }
  await pool.query('UPDATE products SET home_display = $1 WHERE id = $2', [display, productId]);
}

async function buildProductPayload(req) {
  const photoUrls = parseStringArray(req.body.photo_urls);
  const uploadedPhotos = await uploadImageFiles([
    ...(req.files?.photos || []),
    ...(req.files?.['photos[]'] || []),
  ]);
  const mergedPhotoUrls = [...photoUrls, ...uploadedPhotos].filter(Boolean);
  const uploadedVideoUrl = await uploadVideoFile(req.files?.video?.[0]);

  const payload = {
    name: String(req.body.name || '').trim(),
    slug: slugify(req.body.name || ''),
    price: parseNumber(req.body.price),
    description: String(req.body.description || '').trim(),
    materials: String(req.body.materials || '').trim(),
    categoryId: parseNumber(req.body.category_id),
    badge: String(req.body.badge || '').trim() || null,
    inStock: parseBoolean(req.body.in_stock),
    videoUrl: uploadedVideoUrl || String(req.body.video_url || '').trim() || null,
    photoUrls: mergedPhotoUrls,
    homeDisplay: parseHomeDisplay(req.body.home_display),
    homeDisplayProvided: req.body.home_display !== undefined,
  };

  if (!payload.name || !payload.description || !payload.categoryId || payload.price <= 0) {
    throw new ApiError(400, 'Please provide a valid product name, price, description, and category');
  }

  if (payload.photoUrls.length === 0) {
    throw new ApiError(400, 'At least one product photo is required');
  }

  return payload;
}

function productAssetUrls(product) {
  if (!product) {
    return [];
  }

  return [
    ...(Array.isArray(product.photos) ? product.photos : []),
    product.video_url,
  ].filter(Boolean);
}

function cleanupAssets(urls) {
  return deleteCloudinaryAssets(urls).catch((error) => {
    // The database delete/update has already succeeded. Keep the API result accurate
    // and log any cleanup retry that an operator may need to perform.
    console.error('Cloudinary asset cleanup failed:', error.message);
  });
}

exports.login = asyncHandler(async (req, res) => {
  const password = String(req.body.password || '');

  if (!password) {
    throw new ApiError(400, 'Admin password is required');
  }

  const rows = await runFunction('sp_get_customer_auth', [ADMIN_EMAIL]);
  const admin = rows[0];
  let databasePasswordMatches = false;

  if (admin?.password_hash) {
    try {
      databasePasswordMatches = await bcrypt.compare(password, admin.password_hash);
    } catch (error) {
      console.error('Admin password hash is invalid:', error.message);
    }
  }

  const environmentPasswordMatches = Boolean(env.adminPassword) && password === env.adminPassword;
  if (!databasePasswordMatches && !environmentPasswordMatches) {
    throw new ApiError(401, 'Incorrect admin password');
  }

  res.json({
    token: signAdminToken(),
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const [statsRow] = await runFunction('sp_admin_dashboard_stats');
  const recentOrderRows = await runFunction('sp_admin_recent_orders', [5]);
  const recentProductRows = await runFunction('sp_admin_recent_products', [5]);

  res.json({
    stats: mapDashboardStats(statsRow),
    recent_orders: recentOrderRows.map((row) => mapOrderRow(row)),
    recent_products: recentProductRows.map((row) => mapProductRow(row)),
  });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_admin_get_products');
  const displays = await pool.query('SELECT id, home_display FROM products');
  const displayById = new Map(displays.rows.map((row) => [Number(row.id), row.home_display]));
  res.json(rows.map((row) => ({ ...mapProductRow(row), home_display: displayById.get(Number(row.id)) || 'none' })));
});

exports.createProduct = asyncHandler(async (req, res) => {
  const payload = await buildProductPayload(req);
  const rows = await runFunction('sp_admin_add_product', [
    payload.name,
    payload.slug,
    payload.price,
    payload.description,
    payload.materials || null,
    payload.categoryId,
    payload.badge,
    payload.inStock,
    payload.videoUrl,
    payload.photoUrls,
  ]);

  const product = mapProductRow(rows[0]);
  if (payload.homeDisplayProvided) await setHomeDisplay(product.id, payload.homeDisplay);
  res.status(201).json({ ...product, home_display: payload.homeDisplay });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);
  if (!productId) {
    throw new ApiError(400, 'Valid product id is required');
  }

  const existingRows = await runFunction('sp_get_product_by_id', [productId]);
  const existingProduct = existingRows[0];
  const payload = await buildProductPayload(req);
  const rows = await runFunction('sp_admin_update_product', [
    productId,
    payload.name,
    payload.slug,
    payload.price,
    payload.description,
    payload.materials || null,
    payload.categoryId,
    payload.badge,
    payload.inStock,
    payload.videoUrl,
    payload.photoUrls,
  ]);

  const product = mapProductRow(rows[0]);
  if (payload.homeDisplayProvided) await setHomeDisplay(productId, payload.homeDisplay);
  const retainedUrls = new Set(productAssetUrls(product));
  await cleanupAssets(productAssetUrls(existingProduct).filter((url) => !retainedUrls.has(url)));
  res.json({ ...product, home_display: payload.homeDisplay });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);
  if (!productId) {
    throw new ApiError(400, 'Valid product id is required');
  }

  const existingRows = await runFunction('sp_get_product_by_id', [productId]);
  const existingProduct = existingRows[0];
  await runFunction('sp_admin_delete_product', [productId]);
  await cleanupAssets(productAssetUrls(existingProduct));
  res.json({ success: true });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_get_categories');
  res.json(rows.map((row) => mapCategoryRow(row)));
});

exports.createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) {
    throw new ApiError(400, 'Category name is required');
  }

  let image_url = null;
  if (req.file) {
    const uploaded = await uploadImageFiles([req.file]);
    image_url = uploaded[0] || null;
  }

  const rows = await runFunction('sp_admin_add_category', [name, slugify(name), image_url]);
  res.status(201).json(mapCategoryRow(rows[0]));
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  const name = String(req.body.name || '').trim();

  if (!categoryId || !name) {
    throw new ApiError(400, 'Valid category id and name are required');
  }

  let image_url = req.body.existing_image_url || null;
  if (req.file) {
    const uploaded = await uploadImageFiles([req.file]);
    image_url = uploaded[0] || null;
  }

  const rows = await runFunction('sp_admin_update_category', [categoryId, name, slugify(name), image_url]);
  res.json(mapCategoryRow(rows[0]));
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  if (!categoryId) {
    throw new ApiError(400, 'Valid category id is required');
  }

  await runFunction('sp_admin_delete_category', [categoryId]);
  res.json({ success: true });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const status = String(req.query.status || '').trim() || null;
  const rows = await runFunction('sp_admin_get_orders', [status]);
  res.json(rows.map((row) => mapOrderRow(row)));
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.id);
  const status = String(req.body.status || '').trim();

  if (!orderId || !['new', 'confirmed', 'delivered'].includes(status)) {
    throw new ApiError(400, 'A valid order id and status are required');
  }

  await runFunction('sp_admin_update_order_status', [orderId, status]);
  res.json({ success: true });
});

exports.updateWhatsappNumber = asyncHandler(async (req, res) => {
  const whatsappNumber = String(req.body.whatsapp_number || '').trim();

  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    throw new ApiError(400, 'Enter a valid WhatsApp number with country code');
  }

  const rows = await runFunction('sp_admin_update_whatsapp', [whatsappNumber]);
  res.json({
    whatsapp_number: rows[0]?.whatsapp_number || whatsappNumber,
  });
});

exports.getSmtpSettings = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_admin_get_smtp_settings');
  res.json(rows[0] || {});
});

exports.updateSmtpSettings = asyncHandler(async (req, res) => {
  const host = String(req.body.smtp_host || '').trim();
  const port = Number(req.body.smtp_port || 0);
  const secure = req.body.smtp_secure === true || req.body.smtp_secure === 'true';
  const user = String(req.body.smtp_user || '').trim();
  const from = String(req.body.smtp_from || '').trim();
  const receiver = String(req.body.contact_receiver_email || '').trim();
  const password = String(req.body.smtp_password || '');

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !/^\S+@\S+\.\S+$/.test(user) || !/^\S+@\S+\.\S+$/.test(from) || !/^\S+@\S+\.\S+$/.test(receiver)) {
    throw new ApiError(400, 'Enter valid SMTP host, port, email addresses, and credentials');
  }

  const rows = await runFunction('sp_admin_update_smtp_settings', [host, port, secure, user, from, receiver, password ? encrypt(password) : null]);
  res.json(rows[0]);
});

exports.testSmtpSettings = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, 'Enter a valid test email address');
  await sendTestEmail(email);
  res.json({ success: true });
});
