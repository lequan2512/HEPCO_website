const images = require('../services/imageUpload.service');
exports.upload = async (req, res, next) => {
  try { res.json({ success: true, url: await images.uploadImage(req.file) }); } catch (error) { next(error); }
};
exports.remove = async (req, res, next) => {
  try { await images.deleteImage(req.body?.url); res.json({ success: true }); } catch (error) { next(error); }
};
