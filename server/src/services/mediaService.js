const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const ApiError = require('../lib/apiError');

const hasCloudinaryConfig = Boolean(
  env.cloudinaryCloudName &&
  env.cloudinaryApiKey &&
  env.cloudinaryApiSecret
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

async function uploadSingleAsset(file, folder, resourceType) {
  if (!file) {
    return '';
  }

  if (!hasCloudinaryConfig) {
    throw new ApiError(503, 'Media storage is not configured');
  }

  let result;
  try {
    result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder,
        resource_type: resourceType,
      }, (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(uploadResult);
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    const status = Number(error.http_code || 0);
    console.error('Cloudinary upload failed:', {
      status: status || undefined,
      message: error.message,
    });

    if (status === 401 || status === 403) {
      throw new ApiError(
        503,
        'Cloudinary rejected this upload. Verify that the cloud account and API key have upload permission.'
      );
    }

    throw new ApiError(502, 'Could not upload media to Cloudinary. Please try again.');
  }

  return result.secure_url;
}

async function uploadImageFiles(files, folder = 'crochus/products') {
  const uploads = await Promise.all((files || []).map((file) => uploadSingleAsset(file, folder, 'image')));
  return uploads.filter(Boolean);
}

async function uploadVideoFile(file, folder = 'crochus/videos') {
  if (!file) {
    return '';
  }

  return uploadSingleAsset(file, folder, 'video');
}

function cloudinaryAssetFromUrl(url) {
  if (!hasCloudinaryConfig || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== `res.cloudinary.com/${env.cloudinaryCloudName}`) {
      return null;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) {
      return null;
    }

    // Cloudinary URLs can have transformations before the optional version segment.
    const publicIdParts = parts.slice(uploadIndex + 1);
    while (publicIdParts.length && (/^v\d+$/.test(publicIdParts[0]) || publicIdParts[0].includes('_'))) {
      publicIdParts.shift();
    }

    if (!publicIdParts.length) {
      return null;
    }

    const lastPart = publicIdParts.pop();
    const publicId = [...publicIdParts, lastPart.replace(/\.[^.]+$/, '')].join('/');
    const resourceType = parts[0] === 'video' ? 'video' : 'image';
    return publicId ? { publicId, resourceType } : null;
  } catch {
    return null;
  }
}

async function deleteCloudinaryAssets(urls) {
  if (!hasCloudinaryConfig) {
    return;
  }

  const assets = [...new Map(
    (urls || [])
      .map(cloudinaryAssetFromUrl)
      .filter(Boolean)
      .map((asset) => [`${asset.resourceType}:${asset.publicId}`, asset])
  ).values()];

  await Promise.all(assets.map(({ publicId, resourceType }) =>
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true })
  ));
}

module.exports = {
  uploadImageFiles,
  uploadVideoFile,
  deleteCloudinaryAssets,
};
