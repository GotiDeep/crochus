const fs = require('fs/promises');
const path = require('path');
const cloudinary = require('cloudinary').v2;
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
    return `${env.publicServerUrl}/uploads/${path.basename(file.path)}`;
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    resource_type: resourceType,
  });

  await fs.unlink(file.path);
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

module.exports = {
  uploadImageFiles,
  uploadVideoFile,
};

