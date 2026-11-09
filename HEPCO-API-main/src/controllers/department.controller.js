const DepartmentModel = require('../models/department.model');
const AppError = require('../utils/AppError');

exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await DepartmentModel.getAll(req.query);
    res.json(departments);
  } catch (error) {
    next(new AppError('FETCH_FAILED', 500, error.message));
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { code, name, description, type, parent_id } = req.body;
    if (!code) return next(new AppError('MISSING_FIELDS', 400, 'Mã phòng ban là bắt buộc'));

    const department = await DepartmentModel.create({
      code: code.trim(), name, description, type, parent_id
    });
    res.status(201).json(department);
  } catch (error) {
    next(new AppError('CREATE_FAILED', 500, error.message));
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await DepartmentModel.update(req.params.id, req.body);
    res.json(department);
  } catch (error) {
    next(new AppError('UPDATE_FAILED', 500, error.message));
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    await DepartmentModel.delete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(new AppError('DELETE_FAILED', 500, error.message));
  }
};
