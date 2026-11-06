import { API_BASE_URL } from '../constants/api';

const LOCAL_STATIC_PREFIXES = ['/uploads/', '/images/', '/pdf/', '/Public/Upload/'];

export const resolveAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (LOCAL_STATIC_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${API_BASE_URL}${trimmed}`;
  }
  return trimmed;
};

export const formatFileSize = (bytes) => {
  if (!bytes || Number.isNaN(Number(bytes)) || Number(bytes) <= 0) return '';
  const num = Number(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
};

export const sanitizeLegacyHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/(https?:\/\/[^\s"'<>]+)?(https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)/g, '$2')
    .replace(/font-family\s*:[^;"']+(;)?/gi, '')
    .replace(/font-size\s*:[^;"']+(;)?/gi, '')
    .replace(/line-height\s*:[^;"']+(;)?/gi, '');
};
