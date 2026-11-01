const { pool } = require('../config/db');
const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { uploadImageFiles } = require('../services/mediaService');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

function mapFounderStoryRow(row) {
  if (!row) {
    return {
      id: 1,
      title: 'Thankyou Crochus Family',
      story_body: 'We started this journey with a simple mission: to bring you the finest products with exceptional service. Every item we offer is carefully crafted by us by our own hands with lots of love.',
      sub_message: 'Thank you for being part of our story.',
      founder_name: 'CROCHUS - Founder',
      image_url: 'assets/founder.jpg',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    id: Number(row.id),
    title: row.title || 'Thankyou Crochus Family',
    story_body: row.story_body || '',
    sub_message: row.sub_message || '',
    founder_name: row.founder_name || 'CROCHUS - Founder',
    image_url: row.image_url || 'assets/founder.jpg',
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Fallback image save to local disk if Cloudinary fails
async function saveLocalImage(file) {
  const fileName = `founder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${path.extname(file.originalname || '.jpg')}`;
  const filePath = path.join(env.uploadDir, fileName);
  await fs.promises.mkdir(env.uploadDir, { recursive: true });
  await fs.promises.writeFile(filePath, file.buffer);
  return `${env.publicServerUrl}/uploads/${fileName}`;
}

async function uploadFounderAsset(file) {
  if (!file) return null;
  try {
    const urls = await uploadImageFiles([file], 'crochus/founder');
    if (urls && urls[0]) return urls[0];
  } catch (err) {
    console.warn('[FounderStoryController] Cloudinary upload failed, using local storage:', err.message);
  }
  return await saveLocalImage(file);
}

// GET /api/v1/founder-story (Public)
exports.getPublicFounderStory = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM founder_story
    WHERE is_active = TRUE
    ORDER BY id ASC
    LIMIT 1
  `);
  res.json(mapFounderStoryRow(result.rows[0]));
});

// GET /api/v1/admin/founder-story (Admin)
exports.getAdminFounderStory = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM founder_story
    ORDER BY id ASC
    LIMIT 1
  `);
  res.json(mapFounderStoryRow(result.rows[0]));
});

// PUT /api/v1/admin/founder-story (Admin)
exports.updateFounderStory = asyncHandler(async (req, res) => {
  const title = String(req.body.title || 'Thankyou Crochus Family').trim();
  const story_body = String(req.body.story_body || '').trim();
  const sub_message = String(req.body.sub_message || '').trim();
  const founder_name = String(req.body.founder_name || 'CROCHUS - Founder').trim();
  const is_active = req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === 1;

  if (!story_body) {
    throw new ApiError(400, 'Founder story message is required');
  }

  // Get existing
  const existingRes = await pool.query('SELECT * FROM founder_story ORDER BY id ASC LIMIT 1');
  const existing = existingRes.rows[0] || {};

  let image_url = existing.image_url || 'assets/founder.jpg';

  if (req.file) {
    const uploaded = await uploadFounderAsset(req.file);
    if (uploaded) image_url = uploaded;
  } else if (req.body.image_url && String(req.body.image_url).trim()) {
    image_url = String(req.body.image_url).trim();
  }

  let result;
  if (existing.id) {
    result = await pool.query(`
      UPDATE founder_story
      SET title = $1, story_body = $2, sub_message = $3, founder_name = $4, image_url = $5, is_active = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [title, story_body, sub_message, founder_name, image_url, is_active, existing.id]);
  } else {
    result = await pool.query(`
      INSERT INTO founder_story (title, story_body, sub_message, founder_name, image_url, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, story_body, sub_message, founder_name, image_url, is_active]);
  }

  res.json(mapFounderStoryRow(result.rows[0]));
});
