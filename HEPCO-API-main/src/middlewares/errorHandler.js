const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  console.error('Request failed:', err.errorCode || err.code || err.name);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      errorCode: err.errorCode,
      message: err.message
    });
  }

  // Handle Prisma Errors if necessary (Optional, but good practice)
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      errorCode: 'DATABASE_ERROR',
      message: `Database error code: ${err.code}`
    });
  }

  // Default Internal Server Error
  return res.status(500).json({
    errorCode: 'INTERNAL_ERROR',
    message: 'Internal Server Error'
  });
};

module.exports = errorHandler;
