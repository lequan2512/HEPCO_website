const EmployeeModel = require('../models/employee.model');
const AppError = require('../utils/AppError');

exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await EmployeeModel.getAll(req.query);
    res.json(employees);
  } catch (error) {
    next(new AppError('FETCH_FAILED', 500, error.message));
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { employee_code, full_name, department_id, position, email, phone, status, employee_type } = req.body;
    const finalCode = employee_code?.trim();
    
    if (!finalCode || !full_name || !department_id) {
      return next(new AppError('MISSING_FIELDS', 400, 'Mã nhân viên, họ tên và phòng ban là bắt buộc'));
    }

    const employee = await EmployeeModel.create({
      employee_code: finalCode,
      full_name,
      position,
      email,
      phone,
      status,
      department_id: Number(department_id),
      employee_type: employee_type !== undefined && employee_type !== null ? Number(employee_type) : undefined
    });
    res.status(201).json(employee);
  } catch (error) {
    next(new AppError('CREATE_FAILED', 500, error.message));
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { department_id, full_name, ...rest } = req.body;
    
    if (full_name !== undefined && !full_name.trim()) {
      return next(new AppError('INVALID_INPUT', 400, 'Họ tên không được để trống'));
    }
    
    const data = { ...rest };
    if (full_name !== undefined) data.full_name = full_name;
    if (department_id !== undefined) {
      if (!department_id) return next(new AppError('INVALID_INPUT', 400, 'Phòng ban không được để trống'));
      data.department_id = Number(department_id);
    }

    const employee = await EmployeeModel.update(req.params.id, data);
    res.json(employee);
  } catch (error) {
    if (error.code === 'EMPLOYEE_POS_CROSS_ENTERPRISE' || error.message?.includes('máy POS')) {
      return next(new AppError('EMPLOYEE_POS_CROSS_ENTERPRISE', 400, error.message));
    }
    next(new AppError('UPDATE_FAILED', 500, error.message));
  }
};


exports.deleteEmployee = async (req, res, next) => {
  try {
    const result = await EmployeeModel.delete(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'EMPLOYEE_HAS_DEVICES') {
      return next(new AppError('EMPLOYEE_HAS_DEVICES', 400, 'Nhân viên đang giữ thiết bị hoặc máy POS chưa hoàn trả'));
    }
    next(new AppError('DELETE_FAILED', 500, error.message));
  }
};
