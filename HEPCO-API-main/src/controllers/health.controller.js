const HealthModel = require('../models/health.model');
const AppError = require('../utils/AppError');

exports.checkHealth = async (req, res, next) => {
  try {
    const result = await HealthModel.checkDb();
    res.json({
      status: 'healthy',
      database: 'connected',
      serverTime: result[0].serverTime
    });
  } catch (err) {
    next(new AppError('DB_CONNECTION_FAILED', 500, err.message));
  }
};
