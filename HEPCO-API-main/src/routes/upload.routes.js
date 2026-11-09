const router = require('express').Router();
const { verifyToken, requireCmsAdmin } = require('../middlewares/auth.middleware');
const receiveImage = require('../middlewares/imageUpload.middleware');
const controller = require('../controllers/upload.controller');
router.post('/', verifyToken, requireCmsAdmin, receiveImage, controller.upload);
router.delete('/', verifyToken, requireCmsAdmin, controller.remove);
module.exports = router;
