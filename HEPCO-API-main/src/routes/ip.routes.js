const express = require('express');
const router = express.Router();
const ipController = require('../controllers/ip.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware.verifyToken, ipController.getAllIps);
router.post('/', authMiddleware.verifyToken, ipController.addIp);
router.delete('/:id', authMiddleware.verifyToken, ipController.deleteIp);
router.put('/:id', authMiddleware.verifyToken, ipController.updateIp);

module.exports = router;
