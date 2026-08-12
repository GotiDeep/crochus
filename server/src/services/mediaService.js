const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');

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
    return saveLocally(file, resourceType);
  }

  const result = await new Promise((resolve, reject) => {
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

  return result.secure_url;
}

function safeExtension(file, resourceType) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const allowedExtensions = resourceType === 'image'
    ? new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'])
    : new Set(['.mov', '.mp4', '.webm']);

  if (allowedExtensions.has(extension)) {
    return extension;
  }

  return resourceType === 'image' ? '.jpg' : '.mp4';
}

async function saveLocally(file, resourceType) {
  const uploadDir = env.uploadDir;
  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}${safeExtension(file, resourceType)}`;
  await fs.writeFile(path.join(uploadDir, fileName), file.buffer);

  return new URL(`/uploads/${fileName}`, env.publicServerUrl).toString();
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

module.exports = {
  uploadImageFiles,
  uploadVideoFile,
};
