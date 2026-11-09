export const SHOWCASE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const SHOWCASE_MAX_ITEMS = 12;
export const SHOWCASE_TITLE_LIMIT = 160;
export const SHOWCASE_TEXT_LIMIT = 500;
export const SHOWCASE_URL_LIMIT = 1000;
export const isShowcaseUrl = (value, image = false) => {
  if (typeof value !== 'string' || !value || value.length > SHOWCASE_URL_LIMIT || (value.includes('\\') || [...value].some((character) => character.charCodeAt(0) <= 32)) || value.startsWith('//')) return false;
  if (value.startsWith('/') && (!image || value.startsWith('/images/') || value.startsWith('/Public/Upload/') || value.startsWith('/api/media/'))) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
};
