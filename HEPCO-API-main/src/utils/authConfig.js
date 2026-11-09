const AppError = require('../utils/AppError');
const { AUTH } = require('../constants/auth');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || Buffer.byteLength(secret) < AUTH.MIN_SECRET_BYTES) {
    throw new AppError('AUTH_CONFIGURATION_ERROR', 503, 'Authentication is not configured');
  }
  return secret;
};
const getCmsAdminIds = () => new Set((process.env.CMS_ADMIN_USER_IDS || '').split(',').filter((id) => /^[1-9]\d*$/.test(id.trim())).map(Number));
module.exports = { getJwtSecret, getCmsAdminIds };
