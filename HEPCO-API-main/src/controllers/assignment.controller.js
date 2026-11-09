const AssignmentModel = require('../models/assignment.model');
const AppError = require('../utils/AppError');

exports.getAllAssignments = async (req, res, next) => {
  try {
    const assignments = await AssignmentModel.getAll(req.query);
    res.json(assignments);
  } catch (error) {
    next(new AppError('FETCH_FAILED', 500, error.message));
  }
};

exports.getExportData = async (req, res, next) => {
  try {
    const data = await AssignmentModel.getExportData(req.query);
    res.json(data);
  } catch (error) {
    next(new AppError('FETCH_FAILED', 500, error.message));
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const assignment = await AssignmentModel.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    next(new AppError('CREATE_FAILED', 500, error.message));
  }
};

exports.returnAssignment = async (req, res, next) => {
  try {
    await AssignmentModel.returnAssignment(req.params.id, req.body);
    res.json({ message: 'Device returned successfully' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') return next(new AppError('NOT_FOUND', 404, 'Not found'));
    next(new AppError('RETURN_FAILED', 500, error.message));
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await AssignmentModel.update(req.params.id, req.body);
    res.json(assignment);
  } catch (error) {
    next(new AppError('UPDATE_FAILED', 500, error.message));
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    await AssignmentModel.delete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') return next(new AppError('NOT_FOUND', 404, 'Not found'));
    next(new AppError('DELETE_FAILED', 500, error.message));
  }
};

