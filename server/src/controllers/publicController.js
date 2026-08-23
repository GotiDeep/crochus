const asyncHandler = require('../lib/asyncHandler');
const { runFunction } = require('../config/db');
const { mapCategoryRow, mapProductRow } = require('../lib/mappers');
const ApiError = require('../lib/apiError');

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

exports.getHealth = asyncHandler(async (req, res) => {
  res.json({
    status: 'ok',
    service: 'crochus-api',
  });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const page = parseOptionalNumber(req.query.page) || 1;
  const limit = parseOptionalNumber(req.query.limit) || 9;
  const categoryId = parseOptionalNumber(req.query.category_id);
  const excludeId = parseOptionalNumber(req.query.exclude_id);
  const search = String(req.query.search || '').trim() || null;
  const sort = String(req.query.sort || 'newest').trim() || 'newest';
  const featured = String(req.query.featured || '').toLowerCase() === 'true';

  const rows = await runFunction('sp_get_products', [
    categoryId,
    search,
    sort,
    page,
    limit,
    featured,
    excludeId,
  ]);

  const products = rows.map((row) => mapProductRow(row));

  res.json({
    data: products,
    total: rows[0] ? Number(rows[0].total_count || 0) : 0,
    page,
    limit,
  });
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseOptionalNumber(req.query.limit) || 6;
  const rows = await runFunction('sp_get_products', [null, null, 'popular', 1, limit, true, null]);
  res.json(rows.map((row) => mapProductRow(row)));
});

exports.getHomeProducts = asyncHandler(async (req, res) => {
  const display = String(req.params.display || '');
  if (!['hero', 'last_section'].includes(display)) throw new ApiError(400, 'Invalid home display section');
  const rows = await runFunction('sp_get_home_products', [display]);
  res.json(rows.map((row) => mapProductRow(row)));
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_get_product_by_slug', [req.params.slug]);
  const product = rows[0];

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json(mapProductRow(product));
});

exports.getSimilarProducts = asyncHandler(async (req, res) => {
  const productRows = await runFunction('sp_get_product_by_slug', [req.params.slug]);
  const product = productRows[0];

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const similarRows = await runFunction('sp_get_similar_products', [product.category_id, product.id, 3]);
  res.json(similarRows.map((row) => mapProductRow(row)));
});

exports.getCategories = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_get_categories');
  res.json(rows.map((row) => mapCategoryRow(row)));
});

exports.getPublicSettings = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_get_public_settings');
  res.json(rows[0] || { whatsapp_number: '', contact_email: '', instagram_url: '' });
});
