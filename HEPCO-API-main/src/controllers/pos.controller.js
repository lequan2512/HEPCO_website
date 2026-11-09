const PosModel = require('../models/pos.model');
const AppError = require('../utils/AppError');

exports.getAllDevices = async (req, res, next) => {
  try {
    const result = await PosModel.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDeviceById = async (req, res, next) => {
  try {
    const device = await PosModel.getById(req.params.id);
    if (!device) return next(new AppError('NOT_FOUND', 404, 'Không tìm thấy thiết bị POS'));
    res.json(device);
  } catch (error) {
    next(error);
  }
};

exports.createDevice = async (req, res, next) => {
  try {
    const result = await PosModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new AppError('BAD_REQUEST', 400, 'Số Serial POS này đã tồn tại trong hệ thống.'));
    }
    next(error);
  }
};

exports.updateDevice = async (req, res, next) => {
  try {
    const result = await PosModel.update(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new AppError('BAD_REQUEST', 400, 'Số Serial POS này đã trùng với thiết bị khác.'));
    }
    next(error);
  }
};

exports.deleteDevice = async (req, res, next) => {
  try {
    await PosModel.delete(req.params.id);
    res.json({ message: 'Đã xóa thiết bị POS thành công' });
  } catch (error) {
    next(error);
  }
};

exports.assignDevice = async (req, res, next) => {
  try {
    const assignment = await PosModel.assign(req.params.id, req.body);
    res.json({ message: 'Cấp phát thiết bị POS thành công', data: assignment });
  } catch (error) {
    if (error.message) {
      return next(new AppError('BAD_REQUEST', 400, error.message));
    }
    next(error);
  }
};

exports.unassignDevice = async (req, res, next) => {
  try {
    await PosModel.unassign(req.params.id, req.body);
    res.json({ message: 'Thu hồi thiết bị POS thành công' });
  } catch (error) {
    next(error);
  }
};

exports.borrowDevice = async (req, res, next) => {
  try {
    const borrowing = await PosModel.borrow(req.params.id, req.body);
    res.json({ message: 'Cho mượn máy POS từ kho dự phòng thành công', data: borrowing });
  } catch (error) {
    if (error.message) {
      return next(new AppError('BAD_REQUEST', 400, error.message));
    }
    next(error);
  }
};


exports.returnBorrowDevice = async (req, res, next) => {
  try {
    await PosModel.returnBorrow(req.params.id, req.body);
    res.json({ message: 'Nhận trả máy POS mượn thành công, đã trả về kho dự phòng' });
  } catch (error) {
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await PosModel.updateAssignment(req.params.assignmentId, req.body);
    res.json({ message: 'Cập nhật thông tin cấp phát thành công', data: assignment });
  } catch (error) {
    if (error.message) {
      return next(new AppError('BAD_REQUEST', 400, error.message));
    }
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    await PosModel.deleteAssignment(req.params.assignmentId);
    res.json({ message: 'Đã xóa bản ghi cấp phát thành công' });
  } catch (error) {
    if (error.message) {
      return next(new AppError('BAD_REQUEST', 400, error.message));
    }
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await PosModel.getHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

