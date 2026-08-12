const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;

dotenv.config();

const LEGACY_UPLOAD_PREFIX = 'http://localhost:3000/uploads/';
const markdownLinkPattern = /^\s*\[[^\]]*\]\(([^)]+)\)\s*$/;
const localUploadDir = path.join(process.cwd(), 'server', 'uploads');

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set before running this migration.`);
  }

  return value;
}

function normalizePhotoUrl(value) {
  const trimmed = String(value || '').trim();
  const markdownMatch = trimmed.match(markdownLinkPattern);
  return markdownMatch ? markdownMatch[1].trim() : trimmed;
}

function isLegacyUploadUrl(value) {
  return normalizePhotoUrl(value).startsWith(LEGACY_UPLOAD_PREFIX);
}

function isHttpsUrl(value) {
  return normalizePhotoUrl(value).startsWith('https://');
}

function localFilePathForUrl(value) {
  const normalizedUrl = normalizePhotoUrl(value);
  const uploadFileName = path.basename(decodeURIComponent(new URL(normalizedUrl).pathname));
  const localFilePath = path.resolve(localUploadDir, uploadFileName);

  if (!localFilePath.startsWith(`${localUploadDir}${path.sep}`)) {
    throw new Error('Resolved upload path is outside server/uploads.');
  }

  return localFilePath;
}

function getNeonDatabaseUrl() {
  const databaseUrl = requiredEnvironment('DATABASE_URL');
  const databaseHost = new URL(databaseUrl).hostname.toLowerCase();

  if (!databaseHost.endsWith('.neon.tech')) {
    throw new Error('DATABASE_URL must point to a Neon database; localhost and other databases are refused.');
  }

  return databaseUrl;
}

async function uploadToCloudinary(filePath, photoId) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'crochus/products',
    public_id: `legacy-product-photo-${photoId}`,
    overwrite: true,
    resource_type: 'image',
  });

  if (!result.secure_url || !result.secure_url.startsWith('https://res.cloudinary.com/')) {
    throw new Error('Cloudinary did not return a secure delivery URL.');
  }

  return result.secure_url;
}

async function main() {
  const databaseUrl = getNeonDatabaseUrl();
  const cloudName = requiredEnvironment('CLOUDINARY_CLOUD_NAME');
  const apiKey = requiredEnvironment('CLOUDINARY_API_KEY');
  const apiSecret = requiredEnvironment('CLOUDINARY_API_SECRET');

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const summary = { migrated: 0, normalized: 0, failed: 0, unchanged: 0 };

  try {
    const { rows } = await pool.query(`
      SELECT id, product_id, photo_url
      FROM product_photos
      WHERE photo_url LIKE $1 OR photo_url LIKE $2
      ORDER BY id
    `, [`%${LEGACY_UPLOAD_PREFIX}%`, '%](%)%']);

    for (const photo of rows) {
      const normalizedUrl = normalizePhotoUrl(photo.photo_url);

      try {
        if (isLegacyUploadUrl(photo.photo_url)) {
          const filePath = localFilePathForUrl(photo.photo_url);
          await fs.access(filePath);
          const secureUrl = await uploadToCloudinary(filePath, photo.id);
          const update = await pool.query(
            'UPDATE product_photos SET photo_url = $1 WHERE id = $2 AND photo_url = $3 RETURNING id',
            [secureUrl, photo.id, photo.photo_url]
          );

          if (update.rowCount !== 1) {
            throw new Error('Photo row changed during migration; no database URL was overwritten.');
          }

          summary.migrated += 1;
          console.log(`Migrated product photo ${photo.id}.`);
          continue;
        }

        if (normalizedUrl !== photo.photo_url && isHttpsUrl(photo.photo_url)) {
          const update = await pool.query(
            'UPDATE product_photos SET photo_url = $1 WHERE id = $2 AND photo_url = $3 RETURNING id',
            [normalizedUrl, photo.id, photo.photo_url]
          );

          if (update.rowCount !== 1) {
            throw new Error('Photo row changed during normalization; no database URL was overwritten.');
          }

          summary.normalized += 1;
          console.log(`Normalized product photo ${photo.id}.`);
          continue;
        }

        summary.unchanged += 1;
      } catch (error) {
        summary.failed += 1;
        console.error(`Failed product photo ${photo.id}: ${error.message}`);
      }
    }

    const verification = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE photo_url LIKE $1) AS localhost_count,
        COUNT(*) FILTER (WHERE photo_url LIKE 'https://res.cloudinary.com/%') AS cloudinary_count
      FROM product_photos
    `, [`%${LEGACY_UPLOAD_PREFIX}%`]);

    console.log(JSON.stringify({ ...summary, ...verification.rows[0] }));

    if (summary.failed > 0 || Number(verification.rows[0].localhost_count) > 0) {
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Migration aborted: ${error.message}`);
  process.exitCode = 1;
});
