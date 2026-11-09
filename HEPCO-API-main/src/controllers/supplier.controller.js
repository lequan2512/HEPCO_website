const SupplierModel = require('../models/supplier.model');
const AppError = require('../utils/AppError');

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await SupplierModel.getAll(req.query);
    res.json(suppliers);
  } catch (error) {
    next(new AppError('FETCH_FAILED', 500, error.message));
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await SupplierModel.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    next(new AppError('CREATE_FAILED', 500, error.message));
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await SupplierModel.update(req.params.id, req.body);
    res.json(supplier);
  } catch (error) {
    next(new AppError('UPDATE_FAILED', 500, error.message));
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    await SupplierModel.delete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(new AppError('DELETE_FAILED', 500, error.message));
  }
};
