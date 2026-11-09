const DeviceModel = require('../models/device.model');
const AppError = require('../utils/AppError');

exports.getAllDevices = async (req, res, next) => {
  try {
    const result = await DeviceModel.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await DeviceModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getDeviceById = async (req, res, next) => {
  try {
    const device = await DeviceModel.getById(req.params.id);
    if (!device) return next(new AppError('NOT_FOUND', 404, 'Không tìm thấy thiết bị'));
    res.json(device);
  } catch (error) {
    next(error);
  }
};

exports.createDevice = async (req, res, next) => {
  try {
    const result = await DeviceModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateDevice = async (req, res, next) => {
  try {
    const result = await DeviceModel.update(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'NOT_FOUND') return next(new AppError('NOT_FOUND', 404, 'Không tìm thấy thiết bị'));
    if (error.message === 'HAS_CHILDREN') return next(new AppError('BAD_REQUEST', 400, 'Không thể thay đổi danh mục vì thiết bị này đang chứa linh kiện bên trong. Vui lòng tháo linh kiện ra trước.'));
    next(error);
  }
};

exports.deleteDevice = async (req, res, next) => {
  try {
    await DeviceModel.delete(req.params.id);
    res.json({ message: 'Đã xóa thiết bị thành công' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') return next(new AppError('NOT_FOUND', 404, 'Không tìm thấy thiết bị'));
    if (error.message === 'IN_USE') return next(new AppError('BAD_REQUEST', 400, 'Không thể xóa thiết bị đang được sử dụng (in_use). Vui lòng thu hồi thiết bị trước.'));
    if (error.message === 'HAS_CHILDREN_DELETE') return next(new AppError('BAD_REQUEST', 400, 'Không thể xóa thiết bị đang chứa linh kiện bên trong. Vui lòng tháo dỡ các linh kiện ra khỏi thiết bị này trước.'));
    if (error.message === 'HAS_HISTORY') return next(new AppError('BAD_REQUEST', 400, 'Thiết bị này đã có lịch sử cấp phát hoặc bảo trì. Để bảo toàn dữ liệu hệ thống, vui lòng đổi trạng thái thành "Đã thanh lý" thay vì xóa hẳn.'));
    if (error.code === 'P2003') return next(new AppError('BAD_REQUEST', 400, 'Không thể xóa do thiết bị đang ràng buộc với các dữ liệu khác trong hệ thống.'));
    next(error);
  }
};

exports.deleteMultiple = async (req, res, next) => {
  try {
    await DeviceModel.deleteMultiple(req.body.ids);
    res.json({ message: 'Đã xóa các thiết bị thành công' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') return next(new AppError('NOT_FOUND', 404, 'Không tìm thấy thiết bị'));
    if (error.message === 'IN_USE') return next(new AppError('BAD_REQUEST', 400, 'Không thể xóa thiết bị đang được sử dụng (in_use). Vui lòng thu hồi thiết bị trước.'));
    if (error.message === 'HAS_CHILDREN_DELETE') return next(new AppError('BAD_REQUEST', 400, 'Không thể xóa thiết bị đang chứa linh kiện bên trong. Vui lòng tháo dỡ các linh kiện ra khỏi thiết bị này trước.'));
    if (error.message === 'HAS_HISTORY') return next(new AppError('BAD_REQUEST', 400, 'Thiết bị này đã có lịch sử cấp phát hoặc bảo trì. Để bảo toàn dữ liệu hệ thống, vui lòng đổi trạng thái thành "Đã thanh lý" thay vì xóa hẳn.'));
    if (error.code === 'P2003') return next(new AppError('BAD_REQUEST', 400, 'Không thể xóa do thiết bị đang ràng buộc với các dữ liệu khác trong hệ thống.'));
    next(error);
  }
};
