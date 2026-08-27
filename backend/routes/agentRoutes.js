const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// POST /api/agent/investigate
router.post('/investigate', agentController.investigateTransaction);

module.exports = router;
