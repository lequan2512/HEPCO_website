const NewsModel = require('../models/news.model');
const { NEWS_TYPES, NEWS_METADATA_FIELDS, NEWS_MAX_PAGE_SIZE, NEWS_SORTS } = require('../constants/news');
const AppError = require('../utils/AppError');
const positiveId = (value) => {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw new AppError('INVALID_INPUT', 400, 'A positive integer ID is required');
  return Number(value);
};
const validateUrl = (value) => typeof value === 'string' && (value.startsWith('/api/media/images/') || value.startsWith('/images/') || value.startsWith('/pdf/') || value.startsWith('/Public/Upload/') || /^https:\/\//i.test(value));
const payloadFrom = (body) => {
  const { title, content, thumbnail, type, date } = body || {};
  if (typeof title !== 'string' || !title.trim() || title.length > 255 || typeof content !== 'string' || !content.trim()) throw new AppError('MISSING_REQUIRED_FIELDS', 400, 'Title and content are required');
  if (!NEWS_TYPES.includes(type)) throw new AppError('INVALID_INPUT', 400, 'Unsupported article type');
  if (typeof date !== 'string' || !date.trim() || date.length > 20) throw new AppError('INVALID_INPUT', 400, 'An article date of at most 20 characters is required');
  if (thumbnail && (!validateUrl(thumbnail) || thumbnail.length > 500)) throw new AppError('INVALID_INPUT', 400, 'A permanent image URL is required');
  const metadata = {};
  for (const key of NEWS_METADATA_FIELDS) if (body[key] !== undefined) metadata[key] = body[key];
  for (const key of ['summary', 'category', 'documentType', 'slug']) if (metadata[key] !== undefined && (typeof metadata[key] !== 'string' || metadata[key].length > 2000)) throw new AppError('INVALID_INPUT', 400, 'Invalid article metadata');
  if (metadata.publishYear !== undefined && (!Number.isInteger(metadata.publishYear) || metadata.publishYear < 1900 || metadata.publishYear > 9999)) throw new AppError('INVALID_INPUT', 400, 'Invalid publication year');
  if (metadata.relatedIds !== undefined && (!Array.isArray(metadata.relatedIds) || metadata.relatedIds.length > 100 || metadata.relatedIds.some((id) => !Number.isSafeInteger(Number(id)) || Number(id) < 1))) throw new AppError('INVALID_INPUT', 400, 'Invalid related article IDs');
  if (metadata.attachments !== undefined && (!Array.isArray(metadata.attachments) || metadata.attachments.length > 100 || metadata.attachments.some((item) => !item || !validateUrl(item.fileUrl || item.url) || (item.downloadUrl && !validateUrl(item.downloadUrl))))) throw new AppError('PERMANENT_UPLOAD_REQUIRED', 400, 'Attachments must have permanent server URLs');
  return { title: title.trim(), content, thumbnail: thumbnail || '', type, date, metadata };
};
const forwardError = (error, next) => next(error.code === 'P2025' ? new AppError('ARTICLE_NOT_FOUND', 404, 'Article not found') : error);

exports.getAllNews = async (req, res, next) => {
  try {
    const { type, search = '', category, documentTypes, year, sort = 'created_at_desc' } = req.query;
    const page = positiveId(req.query.page || 1);
    const limit = positiveId(req.query.limit || 20);
    if (limit > NEWS_MAX_PAGE_SIZE || (type && type !== 'all' && !NEWS_TYPES.includes(type)) || typeof search !== 'string' || (category !== undefined && typeof category !== 'string') || (documentTypes !== undefined && typeof documentTypes !== 'string') || !Object.hasOwn(NEWS_SORTS, sort)) throw new AppError('INVALID_INPUT', 400, 'Invalid list parameters');
    const parsedYear = year ? positiveId(year) : undefined;
    const result = await NewsModel.getAll({ type, search, category, documentTypes: documentTypes?.split(',').filter(Boolean), year: parsedYear, sort, page, limit });
    res.json(result);
  } catch (error) { next(error); }
};
exports.getNewsById = async (req, res, next) => {
  try {
    const article = await NewsModel.getById(positiveId(req.params.id));
    if (!article) throw new AppError('ARTICLE_NOT_FOUND', 404, 'Article not found');
    res.json(article);
  } catch (error) { next(error); }
};
exports.createNews = async (req, res, next) => {
  try {
    const article = await NewsModel.create({ ...payloadFrom(req.body), author_id: req.user.id });
    res.status(201).json({ success: true, data: article });
  } catch (error) { forwardError(error, next); }
};
exports.updateNews = async (req, res, next) => {
  try {
    const article = await NewsModel.update(positiveId(req.params.id), payloadFrom(req.body));
    res.json({ success: true, data: article });
  } catch (error) { forwardError(error, next); }
};
exports.deleteNews = async (req, res, next) => {
  try {
    const id = positiveId(req.params.id);
    await NewsModel.delete(id);
    res.json({ success: true, id });
  } catch (error) { forwardError(error, next); }
};
