const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.post('/', authMiddleware.verifyToken, authMiddleware.requireCmsAdmin, newsController.createNews);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.requireCmsAdmin, newsController.updateNews);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.requireCmsAdmin, newsController.deleteNews);

module.exports = router;
