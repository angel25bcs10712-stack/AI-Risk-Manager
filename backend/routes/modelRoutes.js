const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');

// GET /api/model-performance
router.get('/', modelController.getModelPerformance);

module.exports = router;
