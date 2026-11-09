import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Search,
  Calendar,
  X,
  Tag,
  FileText,
  Download,
  Eye,
  ArrowRight,
  Paperclip,
  Image as ImageIcon,
  Newspaper,
  Filter,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowUpDown,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ExternalLink
} from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import Loading from '../../../components/Loading';
import Pagination from '../../../components/Pagination';
import PdfFlipbook from '../../../components/PdfFlipbook';
import { ROUTES } from '../../../constants/routes';
import {
  NEWS_CATEGORY,
  NEWS_CATEGORY_LABELS,
  NEWS_CATEGORY_OPTIONS,
  SHAREHOLDER_DOC_TYPE,
  SHAREHOLDER_DOC_TYPE_LABELS,
  SHAREHOLDER_DOC_GROUP,
  SHAREHOLDER_DOC_GROUP_LABELS,
  SHAREHOLDER_DOC_GROUP_OPTIONS,
  GALLERY_CATEGORY,
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_OPTIONS
} from '../../../constants/news';
import { useGetNews, useGetNewsStats, useGetGallery } from '../../../apis/news';
import {
  getShareholderStats,
  getNewsCategoryStats,
  getGalleryList
} from '../../../services/news.service';
import { resolveAssetUrl, formatFileSize } from '../../../utils/assetUrl';

const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  const cleaned = html
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ');
  const tmp = document.createElement('DIV');
  tmp.innerHTML = cleaned;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Mới nhất trước' },
  { value: 'created_at_asc', label: 'Cũ nhất trước' },
  { value: 'title_asc', label: 'Tiêu đề (A → Z)' }
];

const News = ({ pageType = 'news' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSubView =
    searchParams.get('tab') === 'gallery' || location.state?.tab === 'gallery'
      ? 'gallery'
      : 'articles';
  const [activeSubView, setActiveSubView] = useState(initialSubView);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortOption, setSortOption] = useState('created_at_desc');
  const [page, setPage] = useState(1);
  const [shareholderViewMode, setShareholderViewMode] = useState('list');

  // Searchable Category/Document Type Dropdown Popover state
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeSearchTerm, setTypeSearchTerm] = useState('');
  const typeDropdownRef = useRef(null);

  // Expanded attachments tracking for Shareholder items with many files
  const [expandedDocs, setExpandedDocs] = useState({});

  // Gallery state
  const [galleryCategory, setGalleryCategory] = useState(GALLERY_CATEGORY.ALL);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryPage, setGalleryPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(false);

  // PDF Preview Modal state
  const [pdfModal, setPdfModal] = useState(null);

  // Reset filters when pageType or tab query param changes
  const tabParam = searchParams.get('tab');
  const [prevPageType, setPrevPageType] = useState(pageType);
  const [prevTabParam, setPrevTabParam] = useState(tabParam);
  if (pageType !== prevPageType) {
    setPrevPageType(pageType);
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSelectedYear('all');
    setSortOption('created_at_desc');
    setPage(1);
    setIsTypeDropdownOpen(false);
    setTypeSearchTerm('');
    setActiveSubView(tabParam === 'gallery' && pageType === 'news' ? 'gallery' : 'articles');
  } else if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam);
    if (tabParam === 'gallery' && pageType === 'news') {
      setActiveSubView('gallery');
    }
  }

  // Close custom dropdown when clicking outside
  useEffect(() => {
    if (!isTypeDropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTypeDropdownOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const pageSize = pageType === 'shareholders' ? 12 : 9;

  const { data: newsResponse, isLoading: loading } = useGetNews({
    type: pageType,
    page,
    limit: pageSize,
    search: debouncedSearch,
    category: selectedCategory,
    documentType: pageType === 'shareholders' ? selectedCategory : '',
    year: selectedYear,
    sort: sortOption
  });

  const articles = useMemo(() => newsResponse?.data || [], [newsResponse]);
  const meta = newsResponse?.meta || { total: 0, page: 1, limit: pageSize, totalPages: 1 };

  const { data: statsData } = useGetNewsStats();
  const shareholderStats = useMemo(() => statsData?.shareholders || { total: 0, countsByType: {}, countsByGroup: {}, countsByYear: {}, years: [] }, [statsData]);
  const newsStats = useMemo(() => statsData?.news || { total: 0, countsByCategory: {}, countsByYear: {}, years: [] }, [statsData]);

  const { data: galleryResponse } = useGetGallery({
    category: galleryCategory,
    search: gallerySearch,
    page: galleryPage,
    limit: 16
  });

  const galleryItems = galleryResponse?.data || [];
  const allFilteredGallery = galleryItems;
  const galleryMeta = galleryResponse?.meta || { total: 0, page: 1, limit: 16, totalPages: 1 };

  const bannerInfo =
    pageType === 'news'
      ? {
          title: 'Tin tức & Sự kiện',
          description:
            'Cập nhật những thông tin mới nhất về hoạt động sản xuất kinh doanh, bảo vệ môi trường, sự kiện đoàn thể và thông báo chính thức của HEPCO.'
        }
      : {
          title: 'Quan hệ Cổ đông - Chủ đầu tư',
          description:
            'Hệ thống công bố thông tin minh bạch, báo cáo tài chính, báo cáo thường niên, nghị quyết HĐQT và tài liệu Đại hội đồng cổ đông của HEPCO.'
        };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 260, behavior: 'smooth' });
  };

  const handleGalleryPageChange = (newPage) => {
    setGalleryPage(newPage);
    window.scrollTo({ top: 260, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSelectedYear('all');
    setSortOption('created_at_desc');
    setTypeSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedYear !== 'all' ||
    Boolean(searchQuery.trim()) ||
    sortOption !== 'created_at_desc';

  // Helper to get human-readable label for currently selected Category / Group / DocType
  const currentCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') {
      return pageType === 'shareholders' ? 'Tất cả loại tài liệu' : 'Tất cả chuyên mục';
    }
    if (pageType === 'shareholders') {
      if (SHAREHOLDER_DOC_GROUP_LABELS[selectedCategory]) {
        return `Nhóm: ${SHAREHOLDER_DOC_GROUP_LABELS[selectedCategory].shortLabel}`;
      }
      return SHAREHOLDER_DOC_TYPE_LABELS[selectedCategory]?.label || 'Loại tài liệu';
    }
    return NEWS_CATEGORY_LABELS[selectedCategory]?.label || 'Chuyên mục';
  }, [selectedCategory, pageType]);

  // Determine which top-level group is active (either directly or because one of its child types is selected)
  const activeShareholderGroup = useMemo(() => {
    if (selectedCategory === 'all') return SHAREHOLDER_DOC_GROUP.ALL;
    if (SHAREHOLDER_DOC_GROUP_LABELS[selectedCategory]) return selectedCategory;
    const foundGroup = SHAREHOLDER_DOC_GROUP_OPTIONS.find(
      (grp) => grp.types && grp.types.includes(selectedCategory)
    );
    return foundGroup ? foundGroup.value : SHAREHOLDER_DOC_GROUP.ALL;
  }, [selectedCategory]);

  // Keyboard navigation for Lightbox
  const handleNextImage = useCallback(() => {
    if (lightboxIndex === null || allFilteredGallery.length === 0) return;
    setLightboxZoom(false);
    setLightboxIndex((prev) => (prev + 1) % allFilteredGallery.length);
  }, [lightboxIndex, allFilteredGallery.length]);

  const handlePrevImage = useCallback(() => {
    if (lightboxIndex === null || allFilteredGallery.length === 0) return;
    setLightboxZoom(false);
    setLightboxIndex((prev) => (prev - 1 + allFilteredGallery.length) % allFilteredGallery.length);
  }, [lightboxIndex, allFilteredGallery.length]);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        setLightboxZoom(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, handleNextImage, handlePrevImage]);

  const activeLightboxItem =
    lightboxIndex !== null && allFilteredGallery[lightboxIndex]
      ? allFilteredGallery[lightboxIndex]
      : null;

  return (
    <div className="bg-gray-50 pb-20 flex-grow min-h-screen">
      <PageBanner title={bannerInfo.title} description={bannerInfo.description} />

      <div className="container mx-auto px-2.5 sm:px-4 max-w-8xl mt-6 sm:mt-8 md:mt-10">
        {/* Sub-view Switcher for News Page: Articles vs Photo Gallery */}
        {pageType === 'news' && (
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="inline-flex w-full sm:w-auto bg-white p-1.5 rounded-2xl shadow-xs border border-gray-200/80">
              <button
                type="button"
                onClick={() => {
                  setActiveSubView('articles');
                  setSearchParams({});
                }}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubView === 'articles'
                    ? 'bg-hepco-green text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Newspaper className="w-4 h-4 shrink-0" />
                <span className="truncate">Tin tức &amp; Thông báo</span>
                <span
                  className={`text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                    activeSubView === 'articles' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {newsStats.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubView('gallery');
                  setSearchParams({ tab: 'gallery' });
                }}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubView === 'gallery'
                    ? 'bg-hepco-green text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">Thư viện Hình ảnh</span>
                <span
                  className={`text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                    activeSubView === 'gallery' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {getGalleryList({ limit: 1 }).meta.total}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== PHOTO GALLERY VIEW ==================== */}
        {pageType === 'news' && activeSubView === 'gallery' ? (
          <div>
            {/* Gallery Controls */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800">Thư viện Hình ảnh Hoạt động</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {galleryMeta.total} hình ảnh
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Hình ảnh thực tế về hoạt động công ty, vệ sinh môi trường, phương tiện thiết bị và các công trình dự án của HEPCO.
                  </p>
                </div>

                {/* Unified Gallery Search + Topic Select */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm hình ảnh..."
                      value={gallerySearch}
                      onChange={(e) => {
                        setGallerySearch(e.target.value);
                        setGalleryPage(1);
                      }}
                      className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
                    />
                    {gallerySearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setGallerySearch('');
                          setGalleryPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hepco-green w-4 h-4 pointer-events-none" />
                    <select
                      value={galleryCategory}
                      onChange={(e) => {
                        setGalleryCategory(e.target.value);
                        setGalleryPage(1);
                      }}
                      className="w-full sm:w-auto pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-gray-50/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-hepco-green cursor-pointer appearance-none"
                    >
                      {GALLERY_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Single-line Quick Topic Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-gray-100">
                {GALLERY_CATEGORY_OPTIONS.map((opt) => {
                  const isActive = galleryCategory === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setGalleryCategory(opt.value);
                        setGalleryPage(1);
                      }}
                      className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-hepco-green text-white border-hepco-green shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gallery Grid */}
            {galleryItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryItems.map((imgItem, idx) => {
                    const globalIdx = (galleryPage - 1) * 16 + idx;
                    const catStyle =
                      GALLERY_CATEGORY_LABELS[imgItem.category]?.bg ||
                      'bg-emerald-50 text-emerald-700 border-emerald-200';
                    return (
                      <div
                        key={imgItem.id}
                        onClick={() => {
                          setLightboxZoom(false);
                          setLightboxIndex(globalIdx);
                        }}
                        className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="h-52 bg-gray-100 relative overflow-hidden">
                          <img
                            src={resolveAssetUrl(imgItem.url)}
                            alt={imgItem.caption || imgItem.title}
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/cover.png';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                            <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full">
                              <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                            </span>
                          </div>
                          <span
                            className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs backdrop-blur-md bg-white/95 ${catStyle}`}
                          >
                            {imgItem.categoryLabel}
                          </span>
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <p
                            className="text-gray-800 font-bold text-sm line-clamp-2 leading-snug group-hover:text-hepco-green transition-colors"
                            title={imgItem.caption}
                          >
                            {imgItem.caption}
                          </p>
                          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-hepco-green" />
                              {imgItem.date}
                            </span>
                            {imgItem.articleId && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(ROUTES.ARTICLE_DETAIL.replace(':id', imgItem.articleId));
                                }}
                                className="text-hepco-green hover:text-hepco-orange font-bold flex items-center gap-1 cursor-pointer"
                              >
                                Bài viết <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-2xl overflow-hidden shadow-xs border border-gray-200">
                  <Pagination meta={galleryMeta} onPageChange={handleGalleryPageChange} />
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy hình ảnh nào</h3>
                <p className="text-gray-500 text-sm px-6">
                  Không tìm thấy hình ảnh phù hợp với bộ lọc hiện tại.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setGalleryCategory(GALLERY_CATEGORY.ALL);
                    setGallerySearch('');
                    setGalleryPage(1);
                  }}
                  className="mt-6 bg-hepco-green text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 shadow-md transition-all cursor-pointer"
                >
                  Reset bộ lọc
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ==================== ARTICLES & SHAREHOLDERS VIEW ==================== */
          <div>
            {/* Compact, Grouped Filter & Search Control Box */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8 space-y-4">
              {/* Row 1: Title, Result Count & View Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-[#10243b]">{bannerInfo.title}</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {meta.total} {pageType === 'shareholders' ? 'tài liệu công bố' : 'bài viết'}
                    </span>
                  </div>
                  {pageType === 'shareholders' && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Tra cứu nhanh theo nhóm tài liệu, lọc theo năm hoặc chọn chi tiết loại văn bản trong danh sách thả xuống.
                    </p>
                  )}
                </div>

                {/* View Mode Toggle for Shareholders */}
                {pageType === 'shareholders' && (
                  <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShareholderViewMode('list')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        shareholderViewMode === 'list'
                          ? 'bg-white text-hepco-green shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Hiển thị dạng danh sách tài liệu"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Danh sách</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareholderViewMode('grid')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        shareholderViewMode === 'grid'
                          ? 'bg-white text-hepco-green shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Hiển thị dạng lưới thẻ"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Lưới thẻ</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Row 2: Unified Responsive Toolbar: Search Input + Grouped Dropdown + Year Dropdown + Sort Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 pt-1">
                {/* 1. Keyword Search Input (Full width on tablet, 4-5 cols on laptop/desktop) */}
                <div className="relative sm:col-span-2 lg:col-span-4 xl:col-span-5">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={
                      pageType === 'shareholders'
                        ? 'Tìm theo tên văn bản, nghị quyết, báo cáo, cổ tức...'
                        : 'Tìm kiếm theo tiêu đề hoặc nội dung bài viết...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/80 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. Searchable Grouped Document Type / Category Dropdown (Full width on tablet, 3 cols on laptop/desktop) */}
                <div className="relative sm:col-span-2 lg:col-span-3" ref={typeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen((prev) => !prev)}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedCategory !== 'all'
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                        : 'bg-gray-50/80 hover:bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Filter className="w-4 h-4 text-hepco-green shrink-0" />
                      <span className="truncate">{currentCategoryLabel}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                        isTypeDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Popover Dropdown Menu with Search & Grouped Options */}
                  {isTypeDropdownOpen && (
                    <div className="absolute left-0 right-0 sm:w-80 md:w-96 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
                      {/* Quick Filter Inside Dropdown */}
                      <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder={
                              pageType === 'shareholders'
                                ? 'Tìm nhanh loại tài liệu...'
                                : 'Tìm nhanh chuyên mục...'
                            }
                            value={typeSearchTerm}
                            onChange={(e) => setTypeSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-hepco-green"
                          />
                          {typeSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setTypeSearchTerm('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {/* All Option */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('all');
                            setPage(1);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            selectedCategory === 'all'
                              ? 'bg-hepco-green text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>
                            {pageType === 'shareholders'
                              ? 'Tất cả loại tài liệu'
                              : 'Tất cả chuyên mục'}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full ${
                              selectedCategory === 'all'
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {pageType === 'shareholders' ? shareholderStats.total : newsStats.total}
                          </span>
                        </button>

                        {pageType === 'shareholders' ? (
                          /* Grouped Shareholder Document Types */
                          SHAREHOLDER_DOC_GROUP_OPTIONS.filter(
                            (grp) => grp.value !== SHAREHOLDER_DOC_GROUP.ALL
                          ).map((grp) => {
                            const q = typeSearchTerm.trim().toLowerCase();
                            const matchingTypes = (grp.types || []).filter((tKey) => {
                              const label = SHAREHOLDER_DOC_TYPE_LABELS[tKey]?.label || '';
                              return !q || label.toLowerCase().includes(q) || grp.label.toLowerCase().includes(q);
                            });
                            if (matchingTypes.length === 0) return null;
                            const grpCount = shareholderStats.countsByGroup?.[grp.value] || 0;
                            const isGrpSelected = selectedCategory === grp.value;

                            return (
                              <div key={grp.value} className="pt-2 first:pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategory(grp.value);
                                    setPage(1);
                                    setIsTypeDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                                    isGrpSelected
                                      ? 'bg-emerald-100 text-emerald-900'
                                      : 'text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/70'
                                  }`}
                                >
                                  <span>{grp.label}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-emerald-700 border border-emerald-200">
                                    {grpCount}
                                  </span>
                                </button>

                                <div className="mt-1 pl-2 space-y-0.5 border-l-2 border-emerald-100 ml-2">
                                  {matchingTypes.map((tKey) => {
                                    const opt = SHAREHOLDER_DOC_TYPE_LABELS[tKey];
                                    const count = shareholderStats.countsByType?.[tKey] || 0;
                                    if (!opt || count === 0) return null;
                                    const isSelected = selectedCategory === opt.value;
                                    return (
                                      <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCategory(opt.value);
                                          setPage(1);
                                          setIsTypeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                          isSelected
                                            ? 'bg-hepco-green text-white font-bold'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                      >
                                        <span className="truncate text-left flex items-center gap-1.5">
                                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                          <span className="truncate">{opt.label}</span>
                                        </span>
                                        <span
                                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                                            isSelected
                                              ? 'bg-white/20 text-white'
                                              : 'bg-gray-100 text-gray-600'
                                          }`}
                                        >
                                          {count}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          /* News Categories inside Dropdown */
                          NEWS_CATEGORY_OPTIONS.filter(
                            (opt) =>
                              opt.value !== NEWS_CATEGORY.ALL &&
                              (!typeSearchTerm.trim() ||
                                opt.label
                                  .toLowerCase()
                                  .includes(typeSearchTerm.trim().toLowerCase()))
                          ).map((opt) => {
                            const count = newsStats.countsByCategory?.[opt.value] || 0;
                            const isSelected = selectedCategory === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(opt.value);
                                  setPage(1);
                                  setIsTypeDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-hepco-green text-white font-bold'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  <span className="truncate">{opt.label}</span>
                                </span>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {count}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Year Select Dropdown (1 col on tablet, 2-3 cols on laptop/desktop) */}
                <div className="relative sm:col-span-1 lg:col-span-2">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hepco-green w-4 h-4 pointer-events-none" />
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setPage(1);
                    }}
                    className={`w-full pl-9 pr-8 py-2.5 border rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-hepco-green ${
                      selectedYear !== 'all'
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                        : 'bg-gray-50/80 hover:bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <option value="all">
                      Tất cả các năm ({pageType === 'shareholders' ? shareholderStats.total : newsStats.total})
                    </option>
                    {(pageType === 'shareholders' ? shareholderStats.years : newsStats.years || []).map(
                      (yr) => {
                        const yrCount =
                          pageType === 'shareholders'
                            ? shareholderStats.countsByYear?.[yr] || 0
                            : newsStats.countsByYear?.[yr] || 0;
                        return (
                          <option key={yr} value={String(yr)}>
                            Năm {yr} ({yrCount})
                          </option>
                        );
                      }
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* 4. Sort Select Dropdown (1 col on tablet, 3 cols on lg, 2 cols on xl) */}
                <div className="relative sm:col-span-1 lg:col-span-3 xl:col-span-2">
                  <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hepco-green w-4 h-4 pointer-events-none" />
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-gray-50/80 hover:bg-white focus:outline-none focus:ring-2 focus:ring-hepco-green cursor-pointer appearance-none transition-all"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Row 3: Clean Single-Row Quick Group Tabs (5 Main Groups for Shareholders, Categories for News) */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                  {pageType === 'shareholders'
                    ? SHAREHOLDER_DOC_GROUP_OPTIONS.map((grp) => {
                        const isActive = activeShareholderGroup === grp.value;
                        const count = shareholderStats.countsByGroup?.[grp.value] || 0;
                        return (
                          <button
                            key={grp.value}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(grp.value);
                              setPage(1);
                            }}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                              isActive
                                ? 'bg-hepco-green text-white border-hepco-green shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span>{grp.shortLabel}</span>
                            <span
                              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                                isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })
                    : NEWS_CATEGORY_OPTIONS.map((opt) => {
                        const isActive = selectedCategory === opt.value;
                        const count =
                          opt.value === NEWS_CATEGORY.ALL
                            ? newsStats.total
                            : newsStats.countsByCategory?.[opt.value] || 0;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(opt.value);
                              setPage(1);
                            }}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                              isActive
                                ? 'bg-hepco-green text-white border-hepco-green shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span>{opt.label}</span>
                            <span
                              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                                isActive ? 'bg-white/20 text-white' : 'bg-gray-200/70 text-gray-600'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                </div>

                {/* Active Filter Chips & Quick Reset */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {selectedCategory !== 'all' &&
                      !SHAREHOLDER_DOC_GROUP_LABELS[selectedCategory] && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span>{currentCategoryLabel}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory('all');
                              setPage(1);
                            }}
                            className="hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                    {selectedYear !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <span>Năm {selectedYear}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedYear('all');
                            setPage(1);
                          }}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Đặt lại bộ lọc</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area: Keep Controls Mounted, Render Loading Inside Container */}
            <div className="min-h-[320px] flex flex-col justify-between">
              {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col justify-center">
                  <Loading message="Đang tải danh sách dữ liệu..." />
                </div>
              ) : articles.length > 0 ? (
                <>
                  {/* SHAREHOLDERS SCIENTIFIC DOCUMENT LIST VIEW */}
                  {pageType === 'shareholders' && shareholderViewMode === 'list' ? (
                    <div className="space-y-4">
                      {articles.map((doc) => {
                        const docTypeMeta =
                          SHAREHOLDER_DOC_TYPE_LABELS[doc.documentType] ||
                          SHAREHOLDER_DOC_TYPE_LABELS[SHAREHOLDER_DOC_TYPE.OTHER_DOCUMENT];
                        const attachments = doc.attachments || [];
                        const isExpanded = Boolean(expandedDocs[doc.id]);
                        const visibleAttachments = isExpanded
                          ? attachments
                          : attachments.slice(0, 2);
                        const hiddenCount = attachments.length - visibleAttachments.length;

                        return (
                          <div
                            key={doc.id}
                            className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-gray-200/80 p-5 sm:p-6 transition-all duration-200"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                {/* Document Icon Box */}
                                <div
                                  onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', doc.id))}
                                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col items-center justify-center text-hepco-green shrink-0 cursor-pointer hover:bg-hepco-green hover:text-white transition-colors"
                                >
                                  <FileText className="w-6 h-6" />
                                  <span className="text-[9px] font-black uppercase mt-0.5">
                                    {doc.fileExt || 'PDF'}
                                  </span>
                                </div>

                                {/* Title & Metadata */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span
                                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${docTypeMeta.bg}`}
                                    >
                                      {doc.documentTypeLabel || docTypeMeta.label}
                                    </span>
                                    {doc.publishYear && (
                                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                        Năm {doc.publishYear}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                      <Calendar className="w-3.5 h-3.5 text-hepco-green" />
                                      <span>Ngày công bố: {doc.date}</span>
                                    </span>
                                  </div>

                                  <h3
                                    onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', doc.id))}
                                    className="text-base sm:text-lg font-bold text-[#10243b] hover:text-hepco-green transition-colors cursor-pointer leading-snug"
                                  >
                                    {doc.title}
                                  </h3>

                                  {/* Attachments List inside Shareholder Card (Collapsible if > 2 files) */}
                                  {attachments.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                      {visibleAttachments.map((att) => {
                                        const isPdf = (att.ext || '').toLowerCase() === 'pdf';
                                        const resolvedUrl = resolveAssetUrl(att.fileUrl);
                                        const sizeText = formatFileSize(att.size);
                                        return (
                                          <div
                                            key={att.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/90 hover:bg-emerald-50/40 px-3.5 py-2.5 rounded-xl border border-gray-200/70 transition-colors"
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                              <Paperclip className="w-4 h-4 text-hepco-green shrink-0" />
                                              <span
                                                className="text-xs sm:text-sm font-semibold text-gray-800 truncate"
                                                title={att.title}
                                              >
                                                {att.title}
                                              </span>
                                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 shrink-0">
                                                {att.ext || 'PDF'}
                                              </span>
                                              {sizeText && (
                                                <span className="text-[11px] text-gray-400 shrink-0 hidden md:inline">
                                                  ({sizeText})
                                                </span>
                                              )}
                                            </div>

                                            <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
                                              {isPdf && (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setPdfModal({
                                                      url: resolvedUrl,
                                                      fileName: att.fileName || 'tai-lieu-co-dong.pdf',
                                                      title: att.title || doc.title,
                                                      subtitle: `Ngày công bố: ${doc.date} • ${doc.documentTypeLabel || 'Quan hệ cổ đông'}`
                                                    })
                                                  }
                                                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition-all cursor-pointer shadow-2xs"
                                                >
                                                  <Eye className="w-3.5 h-3.5" />
                                                  <span>Xem PDF</span>
                                                </button>
                                              )}

                                              <a
                                                href={resolvedUrl}
                                                download={att.fileName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-hepco-green hover:bg-emerald-700 text-white transition-all shadow-2xs"
                                              >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Tải về</span>
                                              </a>
                                            </div>
                                          </div>
                                        );
                                      })}

                                      {attachments.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setExpandedDocs((prev) => ({
                                              ...prev,
                                              [doc.id]: !prev[doc.id]
                                            }))
                                          }
                                          className="inline-flex items-center gap-1.5 text-xs font-bold text-hepco-green hover:text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                          {isExpanded ? (
                                            <>
                                              <ChevronUp className="w-3.5 h-3.5" />
                                              <span>Thu gọn danh sách tệp</span>
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown className="w-3.5 h-3.5" />
                                              <span>Xem thêm {hiddenCount} tệp tài liệu đính kèm khác</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Detail Action */}
                              <div className="flex lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                <button
                                  type="button"
                                  onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', doc.id))}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-hepco-green bg-gray-100 hover:bg-emerald-50 transition-colors cursor-pointer"
                                >
                                  <span>Chi tiết</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* STANDARD 3-COLUMN CARD GRID (FOR NEWS AND SHAREHOLDERS GRID MODE) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 xl:gap-8">
                      {articles.map((article) => {
                        const catBadge =
                          pageType === 'shareholders'
                            ? SHAREHOLDER_DOC_TYPE_LABELS[article.documentType]
                            : NEWS_CATEGORY_LABELS[article.category];
                        const attCount = article.attachments?.length || 0;
                        const primaryPdf = (article.attachments || []).find(
                          (a) => (a.ext || '').toLowerCase() === 'pdf'
                        );

                        return (
                          <div
                            key={article.id}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            {/* Image Section */}
                            <div
                              className="h-48 sm:h-52 lg:h-56 bg-gray-100 relative overflow-hidden cursor-pointer"
                              onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', article.id))}
                            >
                              <img
                                src={resolveAssetUrl(article.thumbnail)}
                                alt={article.title}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/cover.png';
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                              {catBadge && (
                                <span
                                  className={`absolute top-3.5 right-3.5 text-[11px] font-bold px-3 py-1 rounded-full border shadow-xs backdrop-blur-md bg-white/95 ${catBadge.bg}`}
                                >
                                  {catBadge.label}
                                </span>
                              )}

                              {attCount > 0 && (
                                <span className="absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/65 text-white backdrop-blur-xs flex items-center gap-1">
                                  <Paperclip className="w-3 h-3 text-emerald-400" />
                                  {attCount} tệp đính kèm
                                </span>
                              )}
                            </div>

                            {/* Content Section */}
                            <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between">
                              <div>
                                {/* Metadata */}
                                <div className="flex items-center justify-between gap-2 text-gray-400 text-xs mb-3">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-hepco-green" />
                                    <span>{article.date}</span>
                                  </div>
                                  {article.publishYear && pageType === 'shareholders' && (
                                    <span className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                      Năm {article.publishYear}
                                    </span>
                                  )}
                                </div>

                                {/* Title */}
                                <h3
                                  className="text-gray-900 font-bold text-lg mb-3 line-clamp-2 leading-snug cursor-pointer group-hover:text-hepco-orange transition-colors"
                                  onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', article.id))}
                                  title={article.title}
                                >
                                  {article.title}
                                </h3>

                                {/* Short Description */}
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {article.summary ||
                                    (typeof article.content === 'string'
                                      ? stripHtml(article.content)
                                      : 'Nhấn vào để xem chi tiết nội dung bài viết...')}
                                </p>
                              </div>

                              {/* Footer Actions */}
                              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', article.id))}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10243b] group-hover:text-hepco-green transition-colors cursor-pointer"
                                >
                                  <span>Xem chi tiết</span>
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </button>

                                {primaryPdf && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPdfModal({
                                          url: resolveAssetUrl(primaryPdf.fileUrl),
                                          fileName: primaryPdf.fileName || 'tai-lieu.pdf',
                                          title: primaryPdf.title || article.title,
                                          subtitle: `Ngày đăng: ${article.date}`
                                        })
                                      }
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                                      title="Xem trực tiếp PDF"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Xem PDF</span>
                                    </button>
                                    <a
                                      href={resolveAssetUrl(primaryPdf.downloadUrl)}
                                      download={primaryPdf.fileName}
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-700 hover:bg-hepco-green hover:text-white transition-colors"
                                      title="Tải tài liệu"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Tải về</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="mt-10 rounded-2xl overflow-hidden shadow-xs border border-gray-200">
                    <Pagination meta={meta} onPageChange={handlePageChange} />
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto w-full">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Không tìm thấy {pageType === 'shareholders' ? 'tài liệu' : 'bài viết'} nào
                  </h3>
                  <p className="text-gray-500 text-sm px-6">
                    Không tìm thấy kết quả nào phù hợp với danh mục hoặc từ khóa tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc nhập từ khóa khác.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-6 bg-hepco-green text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 shadow-md transition-all cursor-pointer"
                  >
                    Reset bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inline PDF Viewer Modal */}
      {pdfModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setPdfModal(null)}
        >
          <div
            className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 shrink-0 gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-green-900 text-sm sm:text-base truncate" title={pdfModal.title}>
                  {pdfModal.title}
                </h3>
                {pdfModal.subtitle && (
                  <p className="text-xs text-gray-500 truncate">{pdfModal.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={pdfModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở tab mới
                </a>
                <a
                  href={pdfModal.url}
                  download={pdfModal.fileName}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-hepco-green hover:text-emerald-700 transition-colors bg-green-50 px-3 py-1.5 rounded-lg border border-green-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải xuống
                </a>
                <button
                  type="button"
                  onClick={() => setPdfModal(null)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-2 sm:pt-2 sm:px-2">
              <PdfFlipbook
                pdfUrl={pdfModal.url}
                fileName={pdfModal.fileName}
                title={pdfModal.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal for Gallery */}
      {activeLightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-6 select-none"
          onClick={() => {
            setLightboxIndex(null);
            setLightboxZoom(false);
          }}
        >
          {/* Top Controls */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-black/60 text-white px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/15">
              <span>
                {lightboxIndex + 1} / {allFilteredGallery.length}
              </span>
              <span className="text-emerald-400">•</span>
              <span>{activeLightboxItem.categoryLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => !z)}
                className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title={lightboxZoom ? 'Thu nhỏ' : 'Phóng to'}
              >
                {lightboxZoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(null);
                  setLightboxZoom(false);
                }}
                className="p-2.5 rounded-full bg-white/15 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Prev Button */}
          {allFilteredGallery.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-3 sm:left-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          {/* Main Image */}
          <div
            className="max-w-5xl max-h-[82vh] flex flex-col items-center justify-center overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveAssetUrl(activeLightboxItem.url)}
              alt={activeLightboxItem.caption}
              onClick={() => setLightboxZoom((z) => !z)}
              className={`rounded-xl shadow-2xl transition-transform duration-300 ${
                lightboxZoom
                  ? 'scale-125 cursor-zoom-out max-h-none'
                  : 'max-h-[70vh] w-auto object-contain cursor-zoom-in'
              }`}
            />

            {/* Caption Bar */}
            <div className="mt-4 bg-black/75 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3.5 max-w-3xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div>
                <p className="text-sm sm:text-base font-bold leading-snug">
                  {activeLightboxItem.caption}
                </p>
                <p className="text-xs text-gray-300 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activeLightboxItem.date}</span>
                </p>
              </div>
              {activeLightboxItem.articleId && (
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(null);
                    navigate(ROUTES.ARTICLE_DETAIL.replace(':id', activeLightboxItem.articleId));
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-hepco-green hover:bg-emerald-600 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  <span>Xem bài viết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Next Button */}
          {allFilteredGallery.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-3 sm:right-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default News;
