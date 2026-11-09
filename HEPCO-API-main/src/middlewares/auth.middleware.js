const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { assertAllowedIp } = require('./ip.middleware');
const { getJwtSecret, getCmsAdminIds } = require('../utils/authConfig');
const { AUTH } = require('../constants/auth');
const { isPasswordHash, credentialVersion } = require('../utils/password');
const AppError = require('../utils/AppError');

exports.verifyToken = async (req, res, next) => {
  if (req.user) return next();
  try {
    const header = req.headers.authorization;
    if (typeof header !== 'string' || !/^Bearer \S+$/.test(header)) throw new AppError('TOKEN_MISSING', 401, 'Authentication token is required');
    const secret = getJwtSecret();
    let decoded;
    try {
      decoded = jwt.verify(header.slice(7), secret, { algorithms: [AUTH.ALGORITHM], issuer: AUTH.ISSUER, audience: AUTH.AUDIENCE });
    } catch {
      throw new AppError('TOKEN_INVALID_OR_EXPIRED', 401, 'Authentication token is invalid or expired');
    }
    if (!decoded || typeof decoded !== 'object' || !Number.isSafeInteger(decoded.id) || decoded.id < 1 || typeof decoded.credentialVersion !== 'string') throw new AppError('TOKEN_INVALID_OR_EXPIRED', 401, 'Authentication token is invalid');
    const user = await UserModel.findById(decoded.id);
    if (!user || !isPasswordHash(user.password) || user.username !== decoded.username || credentialVersion(user.password) !== decoded.credentialVersion) throw new AppError('TOKEN_INVALID_OR_EXPIRED', 401, 'Authentication session is no longer valid');
    await assertAllowedIp(req);
    req.user = { id: user.id, username: user.username };
    next();
  } catch (error) { next(error); }
};
exports.requireCmsAdmin = (req, res, next) => {
  if (!req.user || !getCmsAdminIds().has(req.user.id)) return next(new AppError('CMS_ACCESS_DENIED', 403, 'CMS access is not allowed for this account'));
  next();
};
