const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { assertAllowedIp } = require('../middlewares/ip.middleware');
const { getJwtSecret, getCmsAdminIds } = require('../utils/authConfig');
const { verifyPassword, credentialVersion } = require('../utils/password');
const { AUTH } = require('../constants/auth');
const AppError = require('../utils/AppError');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || !username.trim() || username.length > 100 || typeof password !== 'string' || !password || Buffer.byteLength(password) > AUTH.MAX_PASSWORD_BYTES) throw new AppError('MISSING_CREDENTIALS', 400, 'Valid username and password are required');
    const secret = getJwtSecret();
    await assertAllowedIp(req);
    const user = await UserModel.findByUsername(username.trim());
    if (!user || !(await verifyPassword(password, user.password))) throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid username or password');
    const token = jwt.sign({ id: user.id, username: user.username, credentialVersion: credentialVersion(user.password) }, secret, { algorithm: AUTH.ALGORITHM, expiresIn: AUTH.TOKEN_TTL, issuer: AUTH.ISSUER, audience: AUTH.AUDIENCE });
    res.json({ success: true, user: { id: user.id, username: user.username }, token });
  } catch (error) { next(error); }
};
exports.getSession = (req, res) => res.json({ success: true, user: req.user, canManageContent: getCmsAdminIds().has(req.user.id) });
