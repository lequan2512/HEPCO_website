const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { limitLogin } = require('../middlewares/loginLimit.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/login', limitLogin, authController.login);
router.get('/session', verifyToken, authController.getSession);

module.exports = router;
