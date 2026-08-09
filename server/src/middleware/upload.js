const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const productUpload = upload.fields([
  { name: 'photos', maxCount: 8 },
  { name: 'photos[]', maxCount: 8 },
  { name: 'video', maxCount: 1 },
]);

module.exports = {
  productUpload,
};
