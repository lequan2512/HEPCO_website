const express = require('express');
const router = express.Router();
const controller = require('../controllers/baseOffice.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/dispatches', controller.getDispatches);
router.get('/dispatches/:id', controller.getDispatchDetail);
router.post('/dispatches', authMiddleware.verifyToken, controller.createDispatch);
router.get('/requests', controller.getRequests);
router.get('/tasks', controller.getTasks);
router.get('/health', controller.getHealth);

module.exports = router;
