const express = require('express');
const router = express.Router();
const posPaperController = require('../controllers/posPaper.controller');

router.get('/', posPaperController.getAllPaper);
router.post('/', posPaperController.createPaper);
router.put('/:id', posPaperController.updatePaper);
router.delete('/:id', posPaperController.deletePaper);

router.post('/issue', posPaperController.issuePaper);
router.get('/issues', posPaperController.getIssues);

module.exports = router;
