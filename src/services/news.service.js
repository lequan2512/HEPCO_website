import axiosInstance from '../utils/axios';
import migratedData from '../data/migratedData.json';
import { SHAREHOLDER_DOC_GROUP_LABELS } from '../constants/news';

const STORAGE_OVERRIDES_KEY = 'hepco_cms_overrides_v1';

const loadLocalOverrides = () => {
  if (typeof window === 'undefined') return { created: [], updated: {}, deleted: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_OVERRIDES_KEY);
    if (!raw) return { created: [], updated: {}, deleted: [] };
    const parsed = JSON.parse(raw);
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updated: parsed.updated && typeof parsed.updated === 'object' ? parsed.updated : {},
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : []
    };
  } catch {
    return { created: [], updated: {}, deleted: [] };
  }
};

const saveLocalOverrides = (overrides) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage quota errors
  }
};

const normalizeText = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
};

const parseTimestamp = (dateStr, fallbackTs = 0) => {
  if (fallbackTs) return fallbackTs;
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const cleanStr = dateStr.trim();
  const parts = cleanStr.split(' ')[0].split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(cleanStr).getTime() || 0;
    }
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    const timePart = cleanStr.split(' ')[1] || '00:00';
    return new Date(`${year}-${month}-${day}T${timePart}:00`).getTime() || 0;
  }
  return new Date(cleanStr).getTime() || 0;
};

const getBaseCollectionByType = (type) => {
  if (type === 'shareholders') return migratedData.shareholders || [];
  if (type === 'service') return migratedData.services || [];
  if (type === 'about') return migratedData.about || [];
  if (type === 'all') {
    return [
      ...(migratedData.news || []),
      ...(migratedData.shareholders || []),
      ...(migratedData.services || []),
      ...(migratedData.about || [])
    ];
  }
  return migratedData.news || [];
};

const mergeWithOverridesAndApi = (baseList, apiItems = [], type = 'news') => {
  const overrides = loadLocalOverrides();
  const deletedSet = new Set((overrides.deleted || []).map((id) => String(id)));

  const mapById = new Map();
  const seenTitleSet = new Set();

  for (const item of baseList) {
    const strId = String(item.id);
    if (deletedSet.has(strId)) continue;
    const updatedItem = overrides.updated[strId] ? { ...item, ...overrides.updated[strId] } : item;
    mapById.set(strId, updatedItem);
    seenTitleSet.add(normalizeText(updatedItem.title));
  }

  for (const createdItem of overrides.created) {
    if (type !== 'all' && createdItem.type !== type) continue;
    const strId = String(createdItem.id);
    if (deletedSet.has(strId)) continue;
    mapById.set(strId, createdItem);
    seenTitleSet.add(normalizeText(createdItem.title));
  }

  for (const apiItem of apiItems) {
    if (!apiItem || !apiItem.title) continue;
    if (type !== 'all' && apiItem.type && apiItem.type !== type) continue;
    const strId = String(apiItem.id);
    if (deletedSet.has(strId)) continue;
    const normTitle = normalizeText(apiItem.title);
    if (!mapById.has(strId) && !seenTitleSet.has(normTitle)) {
      const ts = parseTimestamp(apiItem.date || apiItem.created_at);
      mapById.set(strId, {
        ...apiItem,
        timestamp: ts,
        category: apiItem.category || 'company_activity',
        categoryLabel: apiItem.categoryLabel || (apiItem.type === 'shareholders' ? 'Tài liệu cổ đông' : 'Hoạt động công ty'),
        attachments: apiItem.attachments || []
      });
      seenTitleSet.add(normTitle);
    }
  }

  return Array.from(mapById.values());
};

export const getNewsList = async (params = {}) => {
  const {
    type = 'news',
    page = 1,
    limit = 9,
    search = '',
    category = '',
    documentType = '',
    year = '',
    sort = 'created_at_desc'
  } = params;

  let apiItems = [];
  // Only fetch live API if it's a custom server or to merge newly added items
  try {
    const response = await axiosInstance.get('/api/news', {
      params: { type, limit: 50, page: 1 },
      timeout: 3500
    });
    if (Array.isArray(response?.data?.data)) {
      apiItems = response.data.data;
    }
  } catch {
    // Use local migrated dataset seamlessly when API is offline or unreachable
  }

  const baseList = getBaseCollectionByType(type);
  let items = mergeWithOverridesAndApi(baseList, apiItems, type);

  // Filter by category / documentType / documentGroup
  const activeCategory = documentType || category;
  if (activeCategory && activeCategory !== 'all') {
    const groupDef = SHAREHOLDER_DOC_GROUP_LABELS[activeCategory];
    if (groupDef && Array.isArray(groupDef.types) && groupDef.types.length > 0) {
      items = items.filter(
        (item) =>
          groupDef.types.includes(item.documentType) ||
          groupDef.types.includes(item.category)
      );
    } else {
      items = items.filter(
        (item) => item.category === activeCategory || item.documentType === activeCategory
      );
    }
  }

  // Filter by publishYear
  if (year && year !== 'all') {
    const numYear = Number(year);
    items = items.filter((item) => Number(item.publishYear) === numYear);
  }

  // Filter by search query
  if (search && search.trim()) {
    const rawQuery = search.trim().toLowerCase();
    const normQuery = normalizeText(search);
    items = items.filter((item) => {
      const titleMatch =
        (item.title || '').toLowerCase().includes(rawQuery) ||
        normalizeText(item.title).includes(normQuery);
      const summaryMatch =
        (item.summary || '').toLowerCase().includes(rawQuery) ||
        normalizeText(item.summary).includes(normQuery);
      const attMatch = (item.attachments || []).some(
        (att) =>
          (att.title || '').toLowerCase().includes(rawQuery) ||
          normalizeText(att.title).includes(normQuery) ||
          (att.fileName || '').toLowerCase().includes(rawQuery)
      );
      return titleMatch || summaryMatch || attMatch;
    });
  }

  // Sort items
  items.sort((a, b) => {
    if (sort === 'title_asc') {
      return (a.title || '').localeCompare(b.title || '', 'vi');
    }
    if (sort === 'title_desc') {
      return (b.title || '').localeCompare(a.title || '', 'vi');
    }
    const timeA = parseTimestamp(a.date, a.timestamp);
    const timeB = parseTimestamp(b.date, b.timestamp);
    if (sort === 'created_at_asc') {
      return timeA - timeB || Number(a.id) - Number(b.id);
    }
    return timeB - timeA || Number(b.id) - Number(a.id);
  });

  // Paginate
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 9);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = items.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    meta: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages
    }
  };
};

export const getArticleById = async (rawId) => {
  if (!rawId) throw new Error('Missing article ID');
  const strId = String(rawId).trim();
  const aliasId = migratedData.legacyIdAliases?.[strId]
    ? String(migratedData.legacyIdAliases[strId])
    : strId;

  const allLocal = mergeWithOverridesAndApi(getBaseCollectionByType('all'), [], 'all');

  let found = allLocal.find(
    (item) =>
      String(item.id) === aliasId ||
      String(item.sourceId) === aliasId ||
      String(item.id) === strId ||
      item.slug === strId
  );

  if (!found) {
    try {
      const response = await axiosInstance.get(`/api/news/${rawId}`, { timeout: 3500 });
      if (response?.data) {
        found = response.data;
      }
    } catch {
      // Fall through
    }
  }

  if (!found) {
    throw new Error('Article not found');
  }

  // Populate rich related articles
  const sameTypePool = allLocal.filter(
    (item) => item.type === found.type && String(item.id) !== String(found.id)
  );

  const explicitRelated = (found.relatedIds || [])
    .map((relId) => allLocal.find((i) => Number(i.id) === Number(relId)))
    .filter(Boolean);

  const sameCategoryPool = sameTypePool.filter(
    (item) =>
      item.category === found.category &&
      !explicitRelated.some((r) => String(r.id) === String(item.id))
  );

  const fallbackPool = sameTypePool.filter(
    (item) =>
      !explicitRelated.some((r) => String(r.id) === String(item.id)) &&
      !sameCategoryPool.some((r) => String(r.id) === String(item.id))
  );

  const relatedArticles = [...explicitRelated, ...sameCategoryPool, ...fallbackPool].slice(0, 6);

  return {
    ...found,
    relatedArticles
  };
};

export const getShareholderStats = () => {
  const list = mergeWithOverridesAndApi(migratedData.shareholders || [], [], 'shareholders');
  const years = Array.from(new Set(list.map((i) => i.publishYear).filter(Boolean))).sort((a, b) => b - a);
  const countsByYear = list.reduce((acc, item) => {
    if (item.publishYear) {
      acc[item.publishYear] = (acc[item.publishYear] || 0) + 1;
    }
    return acc;
  }, {});
  const countsByType = list.reduce((acc, item) => {
    const key = item.documentType || 'other_document';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const countsByGroup = Object.values(SHAREHOLDER_DOC_GROUP_LABELS).reduce((acc, grp) => {
    if (grp.value === 'all') {
      acc[grp.value] = list.length;
    } else {
      acc[grp.value] = (grp.types || []).reduce((sum, t) => sum + (countsByType[t] || 0), 0);
    }
    return acc;
  }, {});
  return {
    total: list.length,
    years,
    countsByYear,
    countsByType,
    countsByGroup
  };
};

export const getNewsCategoryStats = () => {
  const list = mergeWithOverridesAndApi(migratedData.news || [], [], 'news');
  const years = Array.from(new Set(list.map((i) => i.publishYear).filter(Boolean))).sort((a, b) => b - a);
  const countsByYear = list.reduce((acc, item) => {
    if (item.publishYear) {
      acc[item.publishYear] = (acc[item.publishYear] || 0) + 1;
    }
    return acc;
  }, {});
  const countsByCategory = list.reduce((acc, item) => {
    const key = item.category || 'company_activity';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return {
    total: list.length,
    years,
    countsByYear,
    countsByCategory
  };
};

export const getGalleryList = ({ category = 'all', search = '', page = 1, limit = 18 } = {}) => {
  let items = [...(migratedData.gallery || [])];

  if (category && category !== 'all') {
    items = items.filter((item) => item.category === category);
  }

  if (search && search.trim()) {
    const rawQ = search.trim().toLowerCase();
    const normQ = normalizeText(search);
    items = items.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(rawQ) ||
        normalizeText(item.title).includes(normQ) ||
        (item.categoryLabel || '').toLowerCase().includes(rawQ)
    );
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 18);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;

  return {
    data: items.slice(startIndex, startIndex + pageSize),
    allFiltered: items,
    meta: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages
    }
  };
};

export const getAboutPages = () => {
  return migratedData.about || [];
};

export const getMigratedBanners = async () => {
  let apiBanners = [];
  try {
    const response = await axiosInstance.get('/api/banner', { timeout: 3000 });
    if (Array.isArray(response?.data?.data)) {
      apiBanners = response.data.data;
    }
  } catch {
    // Fallback to migrated banners
  }
  const combined = Array.from(new Set([...apiBanners, ...(migratedData.banners || [])]));
  return {
    data: combined,
    meta: {
      total: combined.length,
      page: 1,
      limit: combined.length || 20,
      totalPages: 1
    }
  };
};

export const createNewsItem = async (newPost) => {
  try {
    const response = await axiosInstance.post('/api/news', newPost);
    return response.data;
  } catch {
    const overrides = loadLocalOverrides();
    const createdItem = {
      id: Date.now(),
      ...newPost,
      timestamp: Date.now(),
      status: 'published'
    };
    overrides.created.unshift(createdItem);
    saveLocalOverrides(overrides);
    return createdItem;
  }
};

export const updateNewsItem = async ({ id, ...data }) => {
  try {
    const response = await axiosInstance.put(`/api/news/${id}`, data);
    return response.data;
  } catch {
    const overrides = loadLocalOverrides();
    const strId = String(id);
    overrides.updated[strId] = {
      ...(overrides.updated[strId] || {}),
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveLocalOverrides(overrides);
    return { id, ...data };
  }
};

export const deleteNewsItem = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/news/${id}`);
    return response.data;
  } catch {
    const overrides = loadLocalOverrides();
    const strId = String(id);
    if (!overrides.deleted.includes(strId)) {
      overrides.deleted.push(strId);
    }
    saveLocalOverrides(overrides);
    return { success: true };
  }
};
