import { API_BASE_URL } from '../constants/api';

export const resolveAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  // Local static assets in frontend public folder (e.g. /uploads/images/, /images/, /pdf/)
  if (trimmed.startsWith('/uploads/images/') || trimmed.startsWith('/images/') || trimmed.startsWith('/pdf/')) {
    return trimmed;
  }
  // Uploads, media, and other uploads hosted on backend API
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/media/')) {
    return `${API_BASE_URL}${trimmed}`;
  }
  // Legacy uploads fallback to hepco.com.vn
  if (trimmed.startsWith('/Public/Upload/')) {
    return `https://www.hepco.com.vn${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
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
    .replace(/src=(["'])\/uploads\//gi, `src=$1${API_BASE_URL}/uploads/`)
    .replace(/src=(["'])\/Public\/Upload\//gi, `src=$1https://www.hepco.com.vn/Public/Upload/`)
    .replace(/\sface=(["'])[^"']*\1/gi, '')
    .replace(/font-family\s*:[^;"']+(;)?/gi, '')
    .replace(/font-size\s*:[^;"']+(;)?/gi, '')
    .replace(/line-height\s*:[^;"']+(;)?/gi, '')
    .replace(/mso-[a-z0-9-]+\s*:[^;"']+(;)?/gi, '');
};
