const baseOfficeService = require('../services/baseOffice.service');
const AppError = require('../utils/AppError');

exports.getDispatches = async (req, res, next) => {
  try {
    const result = await baseOfficeService.getDispatches(req.query);
    res.json(result);
  } catch (error) {
    next(new AppError('FETCH_DISPATCHES_FAILED', 500, error.message));
  }
};

exports.getDispatchDetail = async (req, res, next) => {
  try {
    const dispatch = await baseOfficeService.getDispatchDetail(req.params.id);
    res.json({ data: dispatch });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return next(new AppError('NOT_FOUND', 404, 'Không tìm thấy công văn yêu cầu'));
    }
    next(new AppError('FETCH_DETAIL_FAILED', 500, error.message));
  }
};

exports.createDispatch = async (req, res, next) => {
  try {
    const { title, type, sender, receiver } = req.body;
    if (!title || !title.trim()) {
      return next(new AppError('INVALID_INPUT', 400, 'Tiêu đề công văn không được để trống'));
    }

    const created = await baseOfficeService.createDispatch(req.body);
    res.status(201).json({ data: created, message: 'Tạo công văn mới thành công' });
  } catch (error) {
    next(new AppError('CREATE_DISPATCH_FAILED', 500, error.message));
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const result = await baseOfficeService.getRequests(req.query);
    res.json(result);
  } catch (error) {
    next(new AppError('FETCH_REQUESTS_FAILED', 500, error.message));
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const result = await baseOfficeService.getTasks(req.query);
    res.json(result);
  } catch (error) {
    next(new AppError('FETCH_TASKS_FAILED', 500, error.message));
  }
};

exports.getHealth = async (req, res, next) => {
  try {
    const health = await baseOfficeService.checkHealth();
    res.json({ data: health });
  } catch (error) {
    next(new AppError('HEALTH_CHECK_FAILED', 500, error.message));
  }
};
