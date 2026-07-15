const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { runFunction } = require('../config/db');
const { signAdminToken } = require('../lib/auth');
const slugify = require('../lib/slugify');
const { mapCategoryRow, mapDashboardStats, mapOrderRow, mapProductRow } = require('../lib/mappers');
const { uploadImageFiles, uploadVideoFile } = require('../services/mediaService');
const env = require('../config/env');

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
  };

  if (!payload.name || !payload.description || !payload.categoryId || payload.price <= 0) {
    throw new ApiError(400, 'Please provide a valid product name, price, description, and category');
  }

  if (payload.photoUrls.length === 0) {
    throw new ApiError(400, 'At least one product photo is required');
  }

  return payload;
}

exports.login = asyncHandler(async (req, res) => {
  const password = String(req.body.password || '');

  if (!password) {
    throw new ApiError(400, 'Admin password is required');
  }

  if (password !== env.adminPassword) {
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
  res.json(rows.map((row) => mapProductRow(row)));
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

  res.status(201).json(mapProductRow(rows[0]));
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);
  if (!productId) {
    throw new ApiError(400, 'Valid product id is required');
  }

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

  res.json(mapProductRow(rows[0]));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const productId = Number(req.params.id);
  if (!productId) {
    throw new ApiError(400, 'Valid product id is required');
  }

  await runFunction('sp_admin_delete_product', [productId]);
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

  const rows = await runFunction('sp_admin_add_category', [name, slugify(name)]);
  res.status(201).json(mapCategoryRow(rows[0]));
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  const name = String(req.body.name || '').trim();

  if (!categoryId || !name) {
    throw new ApiError(400, 'Valid category id and name are required');
  }

  const rows = await runFunction('sp_admin_update_category', [categoryId, name, slugify(name)]);
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
