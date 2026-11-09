const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const authMiddleware = require('../middlewares/auth.middleware');
const bannerController = require('../controllers/banner.controller');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hepco_banner',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  },
});

const upload = multer({ storage: storage });

router.get('/', bannerController.getAllBanners);
router.post('/', authMiddleware.verifyToken, authMiddleware.requireCmsAdmin, upload.single('image'), bannerController.createBanner);
router.delete('/:filename', authMiddleware.verifyToken, authMiddleware.requireCmsAdmin, bannerController.deleteBanner);

module.exports = router;
