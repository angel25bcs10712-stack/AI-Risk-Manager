/**
 * Model Performance Controller
 * Retrieves genuine test-set evaluation metrics from Python ML service.
 */

const MLClient = require('../services/mlClient');

exports.getModelPerformance = async (req, res, next) => {
  try {
    const evaluation = await MLClient.getModelEvaluation();
    res.json({
      success: true,
      data: evaluation
    });
  } catch (err) {
    next(err);
  }
};
