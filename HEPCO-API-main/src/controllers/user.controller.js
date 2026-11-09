const UserModel = require('../models/user.model');
const AppError = require('../utils/AppError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const users = await UserModel.getAll(page, limit);
    res.json(users);
  } catch (err) {
    next(new AppError('FETCH_FAILED', 500, err.message));
  }
};
