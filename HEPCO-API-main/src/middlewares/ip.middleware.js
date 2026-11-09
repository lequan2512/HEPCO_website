const net = require('node:net');
const IpWhitelistModel = require('../models/ipWhitelist.model');
const AppError = require('../utils/AppError');

const getClientIp = (req) => {
  // Vercel supplies this header at its edge. Other hosts use Express's trusted-proxy policy.
  const raw = process.env.VERCEL === '1'
    ? req.get('x-vercel-forwarded-for') || ''
    : req.ip || req.socket?.remoteAddress || '';
  if (raw === '::1') return '127.0.0.1';
  return raw.startsWith('::ffff:') ? raw.slice(7) : raw;
};
const assertAllowedIp = async (req) => {
  const ip = getClientIp(req);
  if (!net.isIP(ip) || !(await IpWhitelistModel.checkIp(ip))) {
    throw new AppError('IP_NOT_WHITELISTED', 403, 'Access from this IP is not allowed');
  }
};
module.exports = { getClientIp, assertAllowedIp };
