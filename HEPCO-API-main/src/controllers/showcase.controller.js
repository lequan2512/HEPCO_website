const AppError = require('../utils/AppError');
const ShowcaseModel = require('../models/showcase.model');
const homeSections = require('../data/homeSections.json');
const { SHOWCASE_MAX_ITEMS, SHOWCASE_TEXT_LIMIT, SHOWCASE_TITLE_LIMIT, SHOWCASE_URL_LIMIT } = require('../constants/showcase');
const text = (value, max, required = true) => {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new AppError('INVALID_INPUT', 400, 'Invalid showcase text');
  return value.trim();
};
const safeUrl = (value, image = false) => {
  const url = text(value, SHOWCASE_URL_LIMIT);
  if ((url.includes('\\') || [...url].some((character) => character.charCodeAt(0) <= 32)) || url.startsWith('//')) throw new AppError('INVALID_INPUT', 400, 'Invalid showcase URL');
  if (url.startsWith('/') && (!image || url.startsWith('/images/') || url.startsWith('/Public/Upload/') || url.startsWith('/api/media/'))) return url;
  try { if (new URL(url).protocol === 'https:') return url; } catch { /* Reject invalid absolute URLs. */ }
  throw new AppError('INVALID_INPUT', 400, 'A permanent HTTPS or local asset URL is required');
};
const validate = (body) => {
  const { config, version } = body || {};
  if (!config || !Number.isSafeInteger(version) || version < 0 || !Array.isArray(config.items) || config.items.length < 1 || config.items.length > SHOWCASE_MAX_ITEMS) throw new AppError('INVALID_INPUT', 400, 'Invalid showcase configuration');
  const ids = new Set();
  const items = config.items.map((item) => {
    if (!item || typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(item.id) || ids.has(item.id)) throw new AppError('INVALID_INPUT', 400, 'Showcase IDs must be unique');
    ids.add(item.id);
    return { id: item.id, title: text(item.title, SHOWCASE_TITLE_LIMIT), subtitle: text(item.subtitle ?? '', SHOWCASE_TEXT_LIMIT, false), location: text(item.location, SHOWCASE_TEXT_LIMIT, false), scale: text(item.scale, SHOWCASE_TEXT_LIMIT, false), image: safeUrl(item.image, true), href: safeUrl(item.href), linkLabel: text(item.linkLabel, SHOWCASE_TITLE_LIMIT) };
  });
  const sections = config.sections ?? homeSections.map(({ id }) => ({ id, visible: true }));
  if (!Array.isArray(sections) || sections.length !== homeSections.length ||
      new Set(sections.map((section) => section?.id)).size !== homeSections.length ||
      sections.some((section) => !homeSections.some(({ id }) => id === section?.id) || typeof section.visible !== 'boolean')) {
    throw new AppError('INVALID_INPUT', 400, 'Invalid homepage sections');
  }
  return { config: { title: text(config.title, SHOWCASE_TITLE_LIMIT), description: text(config.description, SHOWCASE_TEXT_LIMIT, false), linkLabel: text(config.linkLabel, SHOWCASE_TITLE_LIMIT), href: safeUrl(config.href), items, sections: sections.map(({ id, visible }) => ({ id, visible })) }, version };
};
exports.get = async (req, res, next) => {
  try { res.set('Cache-Control', 'no-store'); res.json({ success: true, ...await ShowcaseModel.get() }); } catch (error) { next(error); }
};
exports.save = async (req, res, next) => {
  try {
    const { config, version } = validate(req.body);
    res.json({ success: true, ...await ShowcaseModel.save(config, version) });
  } catch (error) {
    next(['P2002', 'P2025'].includes(error.code) ? new AppError('SHOWCASE_CONFLICT', 409, 'This section was updated elsewhere. Reload before saving again.') : error);
  }
};
