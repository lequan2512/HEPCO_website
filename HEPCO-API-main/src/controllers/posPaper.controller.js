const PosPaperModel = require('../models/posPaper.model');
const AppError = require('../utils/AppError');

exports.getAllPaper = async (req, res, next) => {
  try {
    const result = await PosPaperModel.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createPaper = async (req, res, next) => {
  try {
    const paper = await PosPaperModel.create(req.body);
    res.status(201).json(paper);
  } catch (error) {
    next(error);
  }
};

exports.updatePaper = async (req, res, next) => {
  try {
    const paper = await PosPaperModel.update(req.params.id, req.body);
    res.json(paper);
  } catch (error) {
    next(error);
  }
};

exports.deletePaper = async (req, res, next) => {
  try {
    await PosPaperModel.delete(req.params.id);
    res.json({ message: 'Đã xóa sản phẩm giấy in khỏi hệ thống' });
  } catch (error) {
    next(error);
  }
};

exports.issuePaper = async (req, res, next) => {
  try {
    const issue = await PosPaperModel.issuePaper(req.body);
    res.status(201).json({ message: 'Cấp phát giấy in thành công', data: issue });
  } catch (error) {
    if (error.message === 'INSUFFICIENT_STOCK') {
      return next(new AppError('BAD_REQUEST', 400, 'Số lượng giấy in tồn kho không đủ để cấp phát.'));
    }
    next(error);
  }
};

exports.getIssues = async (req, res, next) => {
  try {
    const result = await PosPaperModel.getIssues(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
