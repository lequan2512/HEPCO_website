const express = require('express');
const router = express.Router();
const controller = require('../controllers/assignment.controller');

router.get('/', controller.getAllAssignments);
router.get('/export', controller.getExportData);
router.post('/', controller.createAssignment);
router.put('/:id', controller.updateAssignment);
router.put('/:id/return', controller.returnAssignment);
router.delete('/:id', controller.deleteAssignment);

module.exports = router;
