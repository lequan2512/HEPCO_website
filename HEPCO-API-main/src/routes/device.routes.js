const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

// Categories
router.get('/categories', deviceController.getAllCategories);

// CRUD for Devices
router.get('/', deviceController.getAllDevices);
router.get('/:id', deviceController.getDeviceById);
router.post('/', deviceController.createDevice);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);
router.post('/delete-multiple', deviceController.deleteMultiple);

module.exports = router;
