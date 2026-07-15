const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, env.uploadDir);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname || '');
    const baseName = path.basename(file.originalname || 'asset', extension).replace(/[^a-zA-Z0-9-_]+/g, '-');
    callback(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const upload = multer({ storage });

const productUpload = upload.fields([
  { name: 'photos', maxCount: 8 },
  { name: 'photos[]', maxCount: 8 },
  { name: 'video', maxCount: 1 },
]);

module.exports = {
  productUpload,
};
