const multer = require('multer');
const { IMAGE_MAX_BYTES } = require('../constants/upload');
const AppError = require('../utils/AppError');
const receive = multer({ storage: multer.memoryStorage(), limits: { fileSize: IMAGE_MAX_BYTES, files: 1 } }).single('image');
module.exports = (req, res, next) => receive(req, res, (error) => {
  if (error) return next(new AppError('INVALID_IMAGE_UPLOAD', 400, 'Upload one JPEG, PNG, GIF or WebP image of at most 5 MB'));
  next();
});
