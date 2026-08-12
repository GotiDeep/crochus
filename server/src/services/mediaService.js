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
