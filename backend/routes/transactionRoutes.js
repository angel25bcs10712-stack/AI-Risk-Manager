const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validateTransactionInput, validateActionInput } = require('../middleware/validator');

// GET /api/transactions
router.get('/', transactionController.getTransactions);

// GET /api/transactions/:id
router.get('/:id', transactionController.getTransactionById);

// POST /api/transactions
router.post('/', validateTransactionInput, transactionController.createAndAnalyzeTransaction);

// POST /api/transactions/:id/analyze
router.post('/:id/analyze', transactionController.reanalyzeTransaction);

// POST /api/transactions/:id/action
router.post('/:id/action', validateActionInput, transactionController.takeAction);

module.exports = router;
