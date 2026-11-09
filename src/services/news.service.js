import { CONTENT_SOURCE } from '../constants/cms';
import { createServerArticle, updateServerArticle, deleteServerArticle, getServerArticles, getServerArticle } from './article.service';
import axiosInstance from '../utils/axios';
import migratedData from '../data/migratedData.json';
import {
  NEWS_CATEGORY_LABELS,
  SHAREHOLDER_DOC_TYPE_LABELS,
  SHAREHOLDER_DOC_GROUP_LABELS,
  GALLERY_CATEGORY_LABELS
} from '../constants/news';

const STORAGE_OVERRIDES_KEY = 'hepco_cms_overrides_v1';

const DEFAULT_HERO_SETTINGS = {
  headlinePrefix: 'CÔNG TY CỔ PHẦN MÔI TRƯỜNG',
  headlineHighlight: 'VÀ CÔNG TRÌNH ĐÔ THỊ HUẾ',
  subtitle:
    'Gần 50 năm đồng hành cùng tỉnh Thừa Thiên Huế, HEPCO cung ứng trọn gói dịch vụ thu gom chất thải, vệ sinh môi trường, chăm sóc cây xanh công viên và chiếu sáng công cộng đạt chuẩn chất lượng cao.',
  primaryCtaText: 'Khám Phá Dịch Vụ',
  hotlineDisplay: '1900.96.96.69',
  hotlineTel: '1900969669',
  coverImage: '/images/cover.png',
  videoUrl: 'https://www.youtube.com/embed/P7RZLoytEBI?autoplay=1',
  videoButtonText: 'Xem Phim Giới Thiệu'
};

const DEFAULT_ABOUT_SETTINGS = {
  bannerTitle: 'Giới thiệu',
  bannerDescription:
    'Tiền thân là phòng quản lý đô thị và nhà đất được ra đời năm 1975, trải qua quá trình hình thành và phát triển với nhiều cột mốc thay đổi, năm 2015 Công ty trách nhiệm hữu hạn nhà nước Môi trường và Công trình Đô thị Huế trở thành Công ty Cổ phần Môi trường và Công trình đô thị Huế cho đến nay. Là doanh nghiệp nhà nước chi phối 51% cổ phần với bộ máy tổ chức gồm 05 phòng nghiệp vụ và 13 đơn vị xí nghiệp trực thuộc. Hepco là đơn vị uy tín hàng đầu miền Trung hoạt động trong lĩnh vực vệ sinh môi trường và công trình đô thị với gần 500 khách hàng, đối tác trên địa bàn toàn thành phố Huế.',
  hqTitle: 'Trụ sở HEPCO',
  hqAddress: '46 Trần Phú, TP. Huế',
  hqImage: '/images/cover.png',
  openLetterTitle: 'Thư Ngỏ',
  openLetterGreeting: 'Kính gửi Quý khách hàng,',
  openLetterParagraph1:
    'Chúng tôi trân trọng gửi lời chào và sự biết ơn sâu sắc đến Quý khách hàng đã tin tưởng và ủng hộ Công ty Cổ Phần Môi trường và Công trình đô thị Huế (HEPCO) trong suốt thời gian qua. Với bề dày gần 50 năm kinh nghiệm, cùng với đội ngũ nhân sự luôn tận tụy và hệ thống phương tiện thiết bị tiên tiến, chúng tôi khẳng định hoàn toàn đáp ứng mọi yêu cầu của Quý khách hàng trong lĩnh vực vệ sinh môi trường và công trình đô thị.',
  openLetterParagraph2:
    'Trên suốt chặng đường hình thành và phát triển, HEPCO không chỉ là một đối tác được chính quyền đô thị địa phương tín nhiệm giao nhiệm vụ, đặt hàng và thực hiện đấu thầu mà còn là đối tác đáng tin cậy của các tổ chức, doanh nghiệp và cá nhân trong lĩnh vực thu gom, vận chuyển, và xử lý chất thải trên địa bàn thành phố Huế.',
  openLetterHighlight:
    'Ngoài thực hiện các công tác ở lĩnh vực vệ sinh môi trường, chúng tôi còn thực hiện thi công hệ thống điện chiếu sáng đô thị và trang trí đường phố, cũng như các công trình thoát nước, xây dựng hạ tầng, dân dụng và các lĩnh vực kinh doanh đa dạng khác.',
  stats: [
    { value: '50+', label: 'Năm kinh nghiệm' },
    { value: '500+', label: 'Đối tác & Khách hàng' },
    { value: '100%', label: 'Cam kết xanh' },
    { value: 'Hàng Đầu', label: 'Khu vực Miền Trung' }
  ],
  permits: [
    {
      id: 'permit-317',
      title: 'Giấy phép Môi trường',
      number: 'Số 317/GPMT-BTNMT',
      issuer: 'Bộ Tài nguyên và Môi trường',
      fileUrl: '/pdf/7. 317-GP-BTNMT_Signed.pdf',
      fileName: '317-GPMT-BTNMT.pdf',
      theme: 'emerald'
    },
    {
      id: 'permit-48',
      title: 'Giấy phép Môi trường',
      number: 'Số 48/GPMT-UBND',
      issuer: 'UBND thành phố Huế',
      fileUrl: '/pdf/7. 48-GP-UBND_Signed (TTH).pdf',
      fileName: '48-GPMT-UBND.pdf',
      theme: 'blue'
    }
  ],
  orgChartImage: '/images/organizational_chart.png',
  capabilityPdfUrl: '/pdf/HoSoNangLuc2026.pdf',
  capabilityPdfName: 'Hồ_Sơ_Năng_Lực_HEPCO_2026.pdf'
};

const getEmptyOverrides = () => ({
  created: [],
  updated: {},
  deleted: [],
  galleryCreated: [],
  galleryUpdated: {},
  galleryDeleted: [],
  banners: null,
  heroSettings: null,
  aboutSettings: null
});

export const loadLocalOverrides = () => {
  if (typeof window === 'undefined') return getEmptyOverrides();
  try {
    const raw = window.localStorage.getItem(STORAGE_OVERRIDES_KEY);
    if (!raw) return getEmptyOverrides();
    const parsed = JSON.parse(raw);
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updated: parsed.updated && typeof parsed.updated === 'object' ? parsed.updated : {},
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
      galleryCreated: Array.isArray(parsed.galleryCreated) ? parsed.galleryCreated : [],
      galleryUpdated:
        parsed.galleryUpdated && typeof parsed.galleryUpdated === 'object'
          ? parsed.galleryUpdated
          : {},
      galleryDeleted: Array.isArray(parsed.galleryDeleted) ? parsed.galleryDeleted : [],
      banners: Array.isArray(parsed.banners) ? parsed.banners : null,
      heroSettings:
        parsed.heroSettings && typeof parsed.heroSettings === 'object'
          ? parsed.heroSettings
          : null,
      aboutSettings:
        parsed.aboutSettings && typeof parsed.aboutSettings === 'object'
          ? parsed.aboutSettings
          : null
    };
  } catch {
    return getEmptyOverrides();
  }
};

export const saveLocalOverrides = (overrides) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage quota errors
  }
};

export const resetLocalOverrides = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_OVERRIDES_KEY);
};

export const exportCmsDataJson = () => {
  const overrides = loadLocalOverrides();
  return JSON.stringify(overrides, null, 2);
};

export const importCmsDataJson = (jsonStr) => {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid CMS JSON format');
  }
  saveLocalOverrides({
    ...getEmptyOverrides(),
    ...parsed
  });
  return true;
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

const extractYearFromDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date().getFullYear();
  const match = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
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

const enrichArticleMetadata = (item) => {
  if (!item) return item;
  const publishYear = Number(item.publishYear) || extractYearFromDateString(item.date);
  if (item.type === 'shareholders') {
    const docType = item.documentType || item.category || 'other_document';
    const docTypeLabel =
      SHAREHOLDER_DOC_TYPE_LABELS[docType]?.label ||
      item.documentTypeLabel ||
      'Tài liệu & Thông báo khác';
    return {
      ...item,
      publishYear,
      documentType: docType,
      documentTypeLabel: docTypeLabel,
      category: docType,
      categoryLabel: docTypeLabel,
      attachments: Array.isArray(item.attachments) ? item.attachments : []
    };
  }
  const cat = item.category || 'company_activity';
  const catLabel =
    NEWS_CATEGORY_LABELS[cat]?.label || item.categoryLabel || 'Hoạt động công ty';
  return {
    ...item,
    publishYear,
    category: cat,
    categoryLabel: catLabel,
    attachments: Array.isArray(item.attachments) ? item.attachments : []
  };
};

const mergeWithOverridesAndApi = (baseList, apiItems = [], type = 'news') => {
  const overrides = loadLocalOverrides();
  const deletedSet = new Set((overrides.deleted || []).map((id) => String(id)));

  const mapById = new Map();
  const seenTitleSet = new Set();

  for (const createdItem of overrides.created) {
    if (type !== 'all' && createdItem.type !== type) continue;
    const strId = String(createdItem.id);
    if (deletedSet.has(strId)) continue;
    const enriched = enrichArticleMetadata(
      overrides.updated[strId] ? { ...createdItem, ...overrides.updated[strId] } : createdItem
    );
    mapById.set(strId, enriched);
    seenTitleSet.add(normalizeText(enriched.title));
  }

  for (const item of baseList) {
    const strId = String(item.id);
    if (deletedSet.has(strId)) continue;
    const overrideData = overrides.updated[strId] ? { ...overrides.updated[strId] } : null;
    if (
      overrideData &&
      item.type === 'service' &&
      (!overrideData.thumbnail || overrideData.thumbnail === '/images/cover.png') &&
      item.thumbnail &&
      item.thumbnail !== '/images/cover.png'
    ) {
      delete overrideData.thumbnail;
    }
    const updatedItem = enrichArticleMetadata(
      overrideData ? { ...item, ...overrideData } : item
    );
    mapById.set(strId, updatedItem);
    seenTitleSet.add(normalizeText(updatedItem.title));
  }

  for (const apiItem of apiItems) {
    if (!apiItem || !apiItem.title) continue;
    if (type !== 'all' && apiItem.type && apiItem.type !== type) continue;
    const strId = String(apiItem.id);
    if (deletedSet.has(strId)) continue;
    const normTitle = normalizeText(apiItem.title);
    if (!mapById.has(strId) && !seenTitleSet.has(normTitle)) {
      const ts = parseTimestamp(apiItem.date || apiItem.created_at);
      mapById.set(
        strId,
        enrichArticleMetadata({
          ...apiItem,
          timestamp: ts
        })
      );
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

  if (params.requireServer || CONTENT_SOURCE === 'server') {
    try {
      const activeCategory = documentType || category;
      const groupTypes = SHAREHOLDER_DOC_GROUP_LABELS[activeCategory]?.types;
      const response = await getServerArticles({
        type, page, limit, search, sort,
        category: groupTypes?.length ? undefined : (activeCategory && activeCategory !== 'all' ? activeCategory : undefined),
        documentTypes: groupTypes?.length ? groupTypes.join(',') : undefined,
        year: year && year !== 'all' ? year : undefined,
      });
      if (response?.data && response.data.length > 0) {
        return { ...response, data: response.data.map(enrichArticleMetadata) };
      }
    } catch {
      // Fallback seamlessly to local collection when server is offline
    }
  }
  let items = mergeWithOverridesAndApi(getBaseCollectionByType(type), [], type);

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
      totalPages,
      source: 'legacy'
    }
  };
};

export const getArticleById = async (rawId) => {
  if (CONTENT_SOURCE === 'server') {
    try {
      return { ...enrichArticleMetadata(await getServerArticle(rawId)), relatedArticles: [] };
    } catch {
      // Fall through to local collection if server is offline
    }
  }
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
      const response = await axiosInstance.get(`/api/news/${rawId}`, { timeout: 2500 });
      if (response?.data) {
        found = enrichArticleMetadata(response.data);
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
  const years = Array.from(new Set(list.map((i) => i.publishYear).filter(Boolean))).sort(
    (a, b) => b - a
  );
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
  const years = Array.from(new Set(list.map((i) => i.publishYear).filter(Boolean))).sort(
    (a, b) => b - a
  );
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

const getMergedGalleryItems = () => {
  const overrides = loadLocalOverrides();
  const deletedSet = new Set((overrides.galleryDeleted || []).map((id) => String(id)));
  const result = [];

  for (const item of overrides.galleryCreated || []) {
    const strId = String(item.id);
    if (deletedSet.has(strId)) continue;
    const merged = overrides.galleryUpdated?.[strId]
      ? { ...item, ...overrides.galleryUpdated[strId] }
      : item;
    result.push({
      ...merged,
      categoryLabel:
        GALLERY_CATEGORY_LABELS[merged.category]?.label ||
        merged.categoryLabel ||
        'Hoạt động công ty'
    });
  }

  for (const item of migratedData.gallery || []) {
    const strId = String(item.id);
    if (deletedSet.has(strId)) continue;
    const merged = overrides.galleryUpdated?.[strId]
      ? { ...item, ...overrides.galleryUpdated[strId] }
      : item;
    result.push({
      ...merged,
      categoryLabel:
        GALLERY_CATEGORY_LABELS[merged.category]?.label ||
        merged.categoryLabel ||
        'Hoạt động công ty'
    });
  }

  return result;
};

export const getGalleryList = ({ category = 'all', search = '', page = 1, limit = 18 } = {}) => {
  let items = getMergedGalleryItems();

  if (category && category !== 'all') {
    items = items.filter((item) => item.category === category);
  }

  if (search && search.trim()) {
    const rawQ = search.trim().toLowerCase();
    const normQ = normalizeText(search);
    items = items.filter(
      (item) =>
        (item.caption || '').toLowerCase().includes(rawQ) ||
        normalizeText(item.caption).includes(normQ) ||
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

export const createGalleryItem = async (newItem) => {
  const overrides = loadLocalOverrides();
  const cat = newItem.category || 'company';
  const created = {
    id: `gal-${Date.now()}`,
    url: newItem.url,
    caption: newItem.caption || newItem.title || 'Hình ảnh hoạt động HEPCO',
    title: newItem.title || newItem.caption || 'Hình ảnh hoạt động HEPCO',
    category: cat,
    categoryLabel: GALLERY_CATEGORY_LABELS[cat]?.label || 'Hoạt động công ty',
    date:
      newItem.date ||
      new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
    articleId: newItem.articleId || null
  };
  overrides.galleryCreated.unshift(created);
  saveLocalOverrides(overrides);
  return created;
};

export const updateGalleryItem = async ({ id, ...updates }) => {
  const overrides = loadLocalOverrides();
  const strId = String(id);
  const cat = updates.category;
  overrides.galleryUpdated[strId] = {
    ...(overrides.galleryUpdated[strId] || {}),
    ...updates,
    ...(cat ? { categoryLabel: GALLERY_CATEGORY_LABELS[cat]?.label || 'Hoạt động công ty' } : {})
  };
  saveLocalOverrides(overrides);
  return overrides.galleryUpdated[strId];
};

export const deleteGalleryItem = async (id) => {
  const overrides = loadLocalOverrides();
  const strId = String(id);
  if (!overrides.galleryDeleted.includes(strId)) {
    overrides.galleryDeleted.push(strId);
  }
  saveLocalOverrides(overrides);
  return { success: true };
};

export const getAboutPages = () => {
  return mergeWithOverridesAndApi(migratedData.about || [], [], 'about');
};

export const getHeroSettings = () => {
  const overrides = loadLocalOverrides();
  return {
    ...DEFAULT_HERO_SETTINGS,
    ...(overrides.heroSettings || {})
  };
};

export const updateHeroSettings = (newSettings) => {
  const overrides = loadLocalOverrides();
  overrides.heroSettings = {
    ...getHeroSettings(),
    ...newSettings
  };
  saveLocalOverrides(overrides);
  return overrides.heroSettings;
};

export const getAboutSettings = () => {
  const overrides = loadLocalOverrides();
  return {
    ...DEFAULT_ABOUT_SETTINGS,
    ...(overrides.aboutSettings || {})
  };
};

export const updateAboutSettings = (newSettings) => {
  const overrides = loadLocalOverrides();
  overrides.aboutSettings = {
    ...getAboutSettings(),
    ...newSettings
  };
  saveLocalOverrides(overrides);
  return overrides.aboutSettings;
};

export const getMigratedBanners = async () => {
  const overrides = loadLocalOverrides();
  if (Array.isArray(overrides.banners)) {
    return {
      data: overrides.banners,
      meta: {
        total: overrides.banners.length,
        page: 1,
        limit: overrides.banners.length || 20,
        totalPages: 1
      }
    };
  }

  let apiBanners = [];
  try {
    const response = await axiosInstance.get('/api/banner', { timeout: 2500 });
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

export const addBannerItem = async (bannerUrl) => {
  const current = await getMigratedBanners();
  const list = [...(current.data || [])];
  if (!list.includes(bannerUrl)) {
    list.unshift(bannerUrl);
  }
  const overrides = loadLocalOverrides();
  overrides.banners = list;
  saveLocalOverrides(overrides);
  return { success: true, data: list };
};

export const removeBannerItem = async (bannerUrlOrFilename) => {
  const current = await getMigratedBanners();
  const list = (current.data || []).filter(
    (item) => item !== bannerUrlOrFilename && !item.endsWith(`/${bannerUrlOrFilename}`)
  );
  const overrides = loadLocalOverrides();
  overrides.banners = list;
  saveLocalOverrides(overrides);
  return { success: true, data: list };
};

export const reorderBannerItems = async (newBannerList) => {
  const overrides = loadLocalOverrides();
  overrides.banners = Array.isArray(newBannerList) ? newBannerList : [];
  saveLocalOverrides(overrides);
  return { success: true, data: overrides.banners };
};

export const createNewsItem = async (newPost) => {
  const nowStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedPost = enrichArticleMetadata({
    ...newPost,
    date: newPost.date || `${nowStr} 08:00`
  });

  try {
    const res = await createServerArticle(formattedPost);
    if (res && res.id) return enrichArticleMetadata(res);
  } catch {
    // Save to local CMS overrides if server is offline
  }

  const overrides = loadLocalOverrides();
  const createdItem = {
    id: Date.now(),
    ...formattedPost,
    timestamp: Date.now(),
    status: 'published'
  };
  overrides.created.unshift(createdItem);
  saveLocalOverrides(overrides);
  return createdItem;
};

export const updateNewsItem = async ({ id, ...data }) => {
  const formattedData = enrichArticleMetadata({ id, ...data });
  try {
    const res = await updateServerArticle(id, formattedData);
    if (res) return enrichArticleMetadata(res);
  } catch {
    // Persist in local CMS overrides
  }
  const overrides = loadLocalOverrides();
  const strId = String(id);
  overrides.updated[strId] = {
    ...(overrides.updated[strId] || {}),
    ...formattedData,
    updatedAt: new Date().toISOString()
  };
  saveLocalOverrides(overrides);
  return { id, ...formattedData };
};

export const deleteNewsItem = async (id) => {
  try {
    await deleteServerArticle(id);
  } catch {
    // Persist deletion in local CMS overrides
  }
  const overrides = loadLocalOverrides();
  const strId = String(id);
  if (!overrides.deleted.includes(strId)) {
    overrides.deleted.push(strId);
  }
  saveLocalOverrides(overrides);
  return { success: true, id };
};

export const getCmsOverviewCounts = () => {
  const newsCount = mergeWithOverridesAndApi(migratedData.news || [], [], 'news').length;
  const shareholdersCount = mergeWithOverridesAndApi(
    migratedData.shareholders || [],
    [],
    'shareholders'
  ).length;
  const servicesCount = mergeWithOverridesAndApi(migratedData.services || [], [], 'service').length;
  const aboutCount = mergeWithOverridesAndApi(migratedData.about || [], [], 'about').length;
  const galleryCount = getMergedGalleryItems().length;
  const overrides = loadLocalOverrides();
  const bannersCount = Array.isArray(overrides.banners)
    ? overrides.banners.length
    : (migratedData.banners || []).length;

  return {
    newsCount,
    shareholdersCount,
    servicesCount,
    aboutCount,
    galleryCount,
    bannersCount
  };
};
