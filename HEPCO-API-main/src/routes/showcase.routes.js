const router = require('express').Router();
const controller = require('../controllers/showcase.controller');
const { verifyToken, requireCmsAdmin } = require('../middlewares/auth.middleware');
router.get('/', controller.get);
router.put('/', verifyToken, requireCmsAdmin, controller.save);
module.exports = router;
