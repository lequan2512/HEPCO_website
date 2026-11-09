const IpWhitelistModel = require('../models/ipWhitelist.model');
const net = require('net');
const AppError = require('../utils/AppError');

exports.getAllIps = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const ips = await IpWhitelistModel.getAll(page, limit);
    res.json(ips);
  } catch (err) {
    next(new AppError('FETCH_FAILED', 500, err.message));
  }
};

exports.addIp = async (req, res, next) => {
  const { ip, description } = req.body;
  if (!ip) {
    return next(new AppError('MISSING_REQUIRED_FIELDS', 400, 'Thiếu thông tin bắt buộc'));
  }

  if (!net.isIPv4(ip)) {
    return next(new AppError('INVALID_IPV4_FORMAT', 400, 'Định dạng IPv4 không hợp lệ'));
  }
  
  try {
    const exists = await IpWhitelistModel.checkIp(ip);
    if (exists) {
      return next(new AppError('IP_ALREADY_EXISTS', 400, 'Địa chỉ IP đã tồn tại'));
    }

    await IpWhitelistModel.add(ip, description || '');
    res.status(201).json({ success: true });
  } catch (err) {
    next(new AppError('CREATE_FAILED', 500, err.message));
  }
};

exports.deleteIp = async (req, res, next) => {
  const { id } = req.params;
  try {
    await IpWhitelistModel.delete(id);
    res.json({ success: true });
  } catch (err) {
    next(new AppError('DELETE_FAILED', 500, err.message));
  }
};

exports.updateIp = async (req, res, next) => {
  const { id } = req.params;
  const { ip, description } = req.body;
  if (!ip) {
    return next(new AppError('MISSING_REQUIRED_FIELDS', 400, 'Thiếu thông tin bắt buộc'));
  }

  if (!net.isIPv4(ip)) {
    return next(new AppError('INVALID_IPV4_FORMAT', 400, 'Định dạng IPv4 không hợp lệ'));
  }
  try {
    await IpWhitelistModel.update(id, ip, description || '');
    res.json({ success: true });
  } catch (err) {
    next(new AppError('UPDATE_FAILED', 500, err.message));
  }
};
