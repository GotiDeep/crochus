const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 9,
  },
  fileFilter(req, file, callback) {
    const isPhoto = ['photos', 'photos[]', 'image'].includes(file.fieldname);
    const isAllowed = isPhoto ? file.mimetype.startsWith('image/') : file.mimetype.startsWith('video/');

    if (!isAllowed) {
      callback(new Error(isPhoto ? 'Photos must be image files' : 'Video must be a video file'));
      return;
    }

    callback(null, true);
  },
});

const productUpload = upload.fields([
  { name: 'photos', maxCount: 8 },
  { name: 'photos[]', maxCount: 8 },
  { name: 'video', maxCount: 1 },
]);

const categoryUpload = upload.single('image');

module.exports = {
  productUpload,
  categoryUpload,
};
