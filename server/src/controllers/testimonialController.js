const { pool } = require('../config/db');
const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { uploadImageFiles } = require('../services/mediaService');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

function mapTestimonialRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    customer_name: row.customer_name || 'Customer Review',
    customer_location: row.customer_location || '',
    rating: Number(row.rating || 5),
    review_text: row.review_text || '',
    image_url: row.image_url,
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

async function uploadTestimonialAsset(file) {
  if (!file) return null;
  try {
    const urls = await uploadImageFiles([file], 'crochus/testimonials');
    if (urls && urls[0]) return urls[0];
  } catch (err) {
    console.warn('[TestimonialController] Cloudinary upload failed, falling back to local storage:', err.message);
  }
  return await saveLocalImage(file);
}

/**
 * Enforce rule: Maximum 10 active testimonials.
 * When an 11th is added or activated, deactivate the oldest active one(s).
 */
async function enforceMax10Active() {
  const activeRes = await pool.query(`
    SELECT id FROM testimonials
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, id ASC
  `);
  // If 10 or more are already active, deactivate the oldest so new one keeps active at max 10
  if (activeRes.rows.length >= 10) {
    const toDeactivate = activeRes.rows.slice(0, activeRes.rows.length - 9).map(r => r.id);
    await pool.query('UPDATE testimonials SET is_active = FALSE WHERE id = ANY($1::bigint[])', [toDeactivate]);
  }
}

// GET /api/v1/testimonials (Public - Max 10 active screenshots)
exports.getPublicTestimonials = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM testimonials
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, id ASC
    LIMIT 10
  `);
  res.json(result.rows.map(mapTestimonialRow));
});

// GET /api/v1/admin/testimonials (Admin)
exports.getAdminTestimonials = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM testimonials
    ORDER BY sort_order ASC, id ASC
  `);
  res.json(result.rows.map(mapTestimonialRow));
});

// POST /api/v1/admin/testimonials (Admin)
exports.createTestimonial = asyncHandler(async (req, res) => {
  const customer_name = String(req.body.customer_name || 'Customer DM Review').trim();
  const customer_location = String(req.body.customer_location || '').trim();
  const rating = 5;
  const review_text = String(req.body.review_text || '').trim();
  const sort_order = Number(req.body.sort_order || 0);
  const is_active = req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 1;

  let image_url = String(req.body.image_url || '').trim();
  if (req.file) {
    const uploadedUrl = await uploadTestimonialAsset(req.file);
    if (uploadedUrl) image_url = uploadedUrl;
  }

  if (!image_url) {
    throw new ApiError(400, 'Testimonial screenshot image is required. Please upload an image or provide a valid URL.');
  }

  // If new testimonial is active, enforce the max 10 rule: 11th will deactivate oldest active
  if (is_active) {
    await enforceMax10Active();
  }

  const result = await pool.query(`
    INSERT INTO testimonials (customer_name, customer_location, rating, review_text, image_url, sort_order, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [customer_name, customer_location, rating, review_text, image_url, sort_order, is_active]);

  res.status(201).json(mapTestimonialRow(result.rows[0]));
});

// PUT /api/v1/admin/testimonials/:id (Admin)
exports.updateTestimonial = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, 'Valid testimonial id is required');
  }

  const existingRes = await pool.query('SELECT * FROM testimonials WHERE id = $1', [id]);
  if (!existingRes.rows.length) {
    throw new ApiError(404, 'Testimonial not found');
  }
  const existing = existingRes.rows[0];

  const customer_name = req.body.customer_name !== undefined ? String(req.body.customer_name).trim() : existing.customer_name;
  const customer_location = req.body.customer_location !== undefined ? String(req.body.customer_location).trim() : existing.customer_location;
  const review_text = req.body.review_text !== undefined ? String(req.body.review_text).trim() : existing.review_text;
  const sort_order = req.body.sort_order !== undefined ? Number(req.body.sort_order) : existing.sort_order;
  const is_active = req.body.is_active !== undefined
    ? (req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 1)
    : existing.is_active;

  let image_url = existing.image_url;
  if (req.file) {
    const uploadedUrl = await uploadTestimonialAsset(req.file);
    if (uploadedUrl) image_url = uploadedUrl;
  } else if (req.body.image_url && String(req.body.image_url).trim()) {
    image_url = String(req.body.image_url).trim();
  }

  // If turning active from inactive, enforce max 10
  if (is_active && !existing.is_active) {
    await enforceMax10Active();
  }

  const result = await pool.query(`
    UPDATE testimonials
    SET customer_name = $1, customer_location = $2, review_text = $3, image_url = $4, sort_order = $5, is_active = $6, updated_at = NOW()
    WHERE id = $7
    RETURNING *
  `, [customer_name, customer_location, review_text, image_url, sort_order, is_active, id]);

  res.json(mapTestimonialRow(result.rows[0]));
});

// DELETE /api/v1/admin/testimonials/:id (Admin)
exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, 'Valid testimonial id is required');
  }

  const existingRes = await pool.query('SELECT * FROM testimonials WHERE id = $1', [id]);
  if (!existingRes.rows.length) {
    throw new ApiError(404, 'Testimonial not found');
  }

  await pool.query('DELETE FROM testimonials WHERE id = $1', [id]);
  res.json({ success: true, message: 'Testimonial deleted successfully' });
});

// PATCH /api/v1/admin/testimonials/:id/status (Admin)
exports.toggleTestimonialStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, 'Valid testimonial id is required');
  }

  const existingRes = await pool.query('SELECT * FROM testimonials WHERE id = $1', [id]);
  if (!existingRes.rows.length) {
    throw new ApiError(404, 'Testimonial not found');
  }

  const willBeActive = req.body.is_active !== undefined
    ? Boolean(req.body.is_active)
    : !existingRes.rows[0].is_active;

  if (willBeActive && !existingRes.rows[0].is_active) {
    await enforceMax10Active();
  }

  const result = await pool.query(`
    UPDATE testimonials
    SET is_active = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [willBeActive, id]);

  res.json(mapTestimonialRow(result.rows[0]));
});
