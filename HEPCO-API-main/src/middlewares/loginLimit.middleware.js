const AppError = require('../utils/AppError');
const { getClientIp } = require('./ip.middleware');
const { LOGIN_LIMIT } = require('../constants/auth');
const attempts = new Map();

exports.limitLogin = (req, res, next) => {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.expiresAt <= now) attempts.delete(key);
  const key = getClientIp(req);
  let entry = attempts.get(key);
  if (!entry) {
    if (attempts.size >= LOGIN_LIMIT.MAX_TRACKED_IPS) return next(new AppError('LOGIN_RATE_LIMITED', 429, 'Login is temporarily rate limited'));
    entry = { count: 0, expiresAt: now + LOGIN_LIMIT.WINDOW_MS };
    attempts.set(key, entry);
  }
  if (entry.count >= LOGIN_LIMIT.ATTEMPTS) {
    res.setHeader('Retry-After', String(Math.ceil((entry.expiresAt - now) / 1000)));
    return next(new AppError('LOGIN_RATE_LIMITED', 429, 'Too many login attempts'));
  }
  entry.count += 1;
  next();
};
