const { pool, runFunction } = require('../config/db');
const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { uploadImageFiles, deleteCloudinaryAssets } = require('../services/mediaService');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

function mapBannerRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    title: row.title || '',
    subtitle: row.subtitle || '',
    image_url: row.image_url,
    link_url: row.link_url || '/shop',
    button_text: row.button_text || 'Shop Now',
    display_on: row.display_on || 'App, Web',
    sort_order: Number(row.sort_order || 0),
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Fallback image save to local disk if Cloudinary fails
async function saveLocalImage(file) {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname || '.jpg')}`;
  const filePath = path.join(env.uploadDir, fileName);
  await fs.promises.mkdir(env.uploadDir, { recursive: true });
  await fs.promises.writeFile(filePath, file.buffer);
  return `${env.publicServerUrl}/uploads/${fileName}`;
}

async function uploadBannerAsset(file) {
  if (!file) return null;
  try {
    const urls = await uploadImageFiles([file], 'crochus/banners');
    if (urls && urls[0]) return urls[0];
  } catch (err) {
    console.warn('[BannerController] Cloudinary upload failed, falling back to local storage:', err.message);
  }
  return await saveLocalImage(file);
}

// GET /api/v1/banners (Public)
exports.getPublicBanners = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM banners
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, id ASC
  `);
  res.json(result.rows.map(mapBannerRow));
});

// GET /api/v1/admin/banners (Admin)
exports.getAdminBanners = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM banners
    ORDER BY sort_order ASC, id ASC
  `);
  res.json(result.rows.map(mapBannerRow));
});

// POST /api/v1/admin/banners (Admin)
exports.createBanner = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const title = String(req.body.title || '').trim();
  const subtitle = String(req.body.subtitle || '').trim();
  const link_url = String(req.body.link_url || '/shop').trim();
  const button_text = String(req.body.button_text || 'Shop Now').trim();
  const display_on = String(req.body.display_on || 'App, Web').trim();
  const sort_order = Number(req.body.sort_order || 0);
  const is_active = req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 1;

  if (!name) {
    throw new ApiError(400, 'Banner name is required');
  }

  let image_url = String(req.body.image_url || '').trim();
  if (req.file) {
    const uploadedUrl = await uploadBannerAsset(req.file);
    if (uploadedUrl) image_url = uploadedUrl;
  }

  if (!image_url) {
    throw new ApiError(400, 'Banner image is required. Please upload an image or provide an image URL.');
  }

  const result = await pool.query(`
    INSERT INTO banners (name, title, subtitle, image_url, link_url, button_text, display_on, sort_order, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [name, title, subtitle, image_url, link_url, button_text, display_on, sort_order, is_active]);

  res.status(201).json(mapBannerRow(result.rows[0]));
});

// PUT /api/v1/admin/banners/:id (Admin)
exports.updateBanner = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    throw new ApiError(400, 'Valid banner id is required');
  }

  const existingRes = await pool.query('SELECT * FROM banners WHERE id = $1', [id]);
  if (!existingRes.rows.length) {
    throw new ApiError(404, 'Banner not found');
  }
  const existing = existingRes.rows[0];

  const name = String(req.body.name || existing.name).trim();
  const title = req.body.title !== undefined ? String(req.body.title).trim() : existing.title;
  const subtitle = req.body.subtitle !== undefined ? String(req.body.subtitle).trim() : existing.subtitle;
  const link_url = req.body.link_url !== undefined ? String(req.body.link_url).trim() : existing.link_url;
  const button_text = req.body.button_text !== undefined ? String(req.body.button_text).trim() : existing.button_text;
  const display_on = req.body.display_on !== undefined ? String(req.body.display_on).trim() : existing.display_on;
  const sort_order = req.body.sort_order !== undefined ? Number(req.body.sort_order) : existing.sort_order;
  const is_active = req.body.is_active !== undefined
    ? (req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 1)
    : existing.is_active;

  let image_url = existing.image_url;
  if (req.file) {
    const uploadedUrl = await uploadBannerAsset(req.file);
    if (uploadedUrl) {
      image_url = uploadedUrl;
      // Clean up old cloudinary asset if applicable
      if (existing.image_url && existing.image_url !== image_url) {
        deleteCloudinaryAssets([existing.image_url]).catch(() => {});
      }
    }
  } else if (req.body.image_url && String(req.body.image_url).trim()) {
    image_url = String(req.body.image_url).trim();
  }

  const result = await pool.query(`
    UPDATE banners
    SET name = $1, title = $2, subtitle = $3, image_url = $4, link_url = $5,
        button_text = $6, display_on = $7, sort_order = $8, is_active = $9, updated_at = NOW()
    WHERE id = $10
    RETURNING *
  `, [name, title, subtitle, image_url, link_url, button_text, display_on, sort_order, is_active, id]);

  res.json(mapBannerRow(result.rows[0]));
});

// DELETE /api/v1/admin/banners/:id (Admin)
exports.deleteBanner = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    throw new ApiError(400, 'Valid banner id is required');
  }

  const existingRes = await pool.query('SELECT * FROM banners WHERE id = $1', [id]);
  if (!existingRes.rows.length) {
    throw new ApiError(404, 'Banner not found');
  }
  const existing = existingRes.rows[0];

  await pool.query('DELETE FROM banners WHERE id = $1', [id]);
  if (existing.image_url) {
    deleteCloudinaryAssets([existing.image_url]).catch(() => {});
  }

  res.json({ success: true, message: 'Banner deleted successfully' });
});

// PATCH /api/v1/admin/banners/:id/status (Admin)
exports.toggleBannerStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    throw new ApiError(400, 'Valid banner id is required');
  }

  const existingRes = await pool.query('SELECT * FROM banners WHERE id = $1', [id]);
  if (!existingRes.rows.length) {
    throw new ApiError(404, 'Banner not found');
  }
  const existing = existingRes.rows[0];
  const newStatus = req.body.is_active !== undefined
    ? (req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 1)
    : !existing.is_active;

  const result = await pool.query(`
    UPDATE banners
    SET is_active = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [newStatus, id]);

  res.json(mapBannerRow(result.rows[0]));
});
