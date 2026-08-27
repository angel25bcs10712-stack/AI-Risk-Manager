/**
 * Input Validation Middleware
 */

function validateTransactionInput(req, res, next) {
  const { amount, customerId, merchant, location, usualLocation } = req.body;

  const errors = [];

  if (amount === undefined || amount === null || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push('amount is required and must be a positive number.');
  }
  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    errors.push('customerId is required and must be a non-empty string.');
  }
  if (!merchant || typeof merchant !== 'string' || merchant.trim() === '') {
    errors.push('merchant is required and must be a non-empty string.');
  }
  if (!location || typeof location !== 'string' || location.trim() === '') {
    errors.push('location is required.');
  }
  if (!usualLocation || typeof usualLocation !== 'string' || usualLocation.trim() === '') {
    errors.push('usualLocation is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
}

function validateActionInput(req, res, next) {
  const { action, reason } = req.body;
  const allowedActions = ['APPROVE', 'MANUAL_REVIEW', 'BLOCK'];

  if (!action || !allowedActions.includes(action.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid action '${action}'. Allowed values: ${allowedActions.join(', ')}.`
    });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'reason is required (minimum 3 characters).'
    });
  }

  next();
}

module.exports = {
  validateTransactionInput,
  validateActionInput
};
