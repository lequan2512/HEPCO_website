const express = require('express');
const router = express.Router();
const posController = require('../controllers/pos.controller');

// POS CRUD
router.get('/', posController.getAllDevices);
router.get('/:id', posController.getDeviceById);
router.post('/', posController.createDevice);
router.put('/:id', posController.updateDevice);
router.delete('/:id', posController.deleteDevice);

// POS Allocation (Cấp phát / Thu hồi)
router.post('/:id/assign', posController.assignDevice);
router.post('/:id/unassign', posController.unassignDevice);
router.put('/assignments/:assignmentId', posController.updateAssignment);
router.delete('/assignments/:assignmentId', posController.deleteAssignment);

// POS Borrowing (Cho mượn / Nhận trả kho dự phòng)
router.post('/:id/borrow', posController.borrowDevice);
router.post('/:id/return-borrow', posController.returnBorrowDevice);

// POS History
router.get('/:id/history', posController.getHistory);

module.exports = router;
