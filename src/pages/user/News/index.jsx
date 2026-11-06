import { useState, useMemo, useEffect, useCallback } from 'react';
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
  SHAREHOLDER_DOC_TYPE_OPTIONS,
  GALLERY_CATEGORY,
  GALLERY_CATEGORY_LABELS,
  GALLERY_CATEGORY_OPTIONS
} from '../../../constants/news';
import { useGetNews } from '../../../apis/news';
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

const News = ({ pageType = 'news' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSubView = searchParams.get('tab') === 'gallery' || location.state?.tab === 'gallery' ? 'gallery' : 'articles';
  const [activeSubView, setActiveSubView] = useState(initialSubView);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [page, setPage] = useState(1);
  const [shareholderViewMode, setShareholderViewMode] = useState('list');

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
    setPage(1);
    setActiveSubView(tabParam === 'gallery' && pageType === 'news' ? 'gallery' : 'articles');
  } else if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam);
    if (tabParam === 'gallery' && pageType === 'news') {
      setActiveSubView('gallery');
    }
  }

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
    year: selectedYear
  });

  const articles = useMemo(() => newsResponse?.data || [], [newsResponse]);
  const meta = newsResponse?.meta || { total: 0, page: 1, limit: pageSize, totalPages: 1 };

  const shareholderStats = useMemo(() => getShareholderStats(), []);
  const newsStats = useMemo(() => getNewsCategoryStats(), []);

  const galleryResponse = useMemo(
    () =>
      getGalleryList({
        category: galleryCategory,
        search: gallerySearch,
        page: galleryPage,
        limit: 16
      }),
    [galleryCategory, gallerySearch, galleryPage]
  );

  const galleryItems = galleryResponse.data || [];
  const allFilteredGallery = galleryResponse.allFiltered || [];
  const galleryMeta = galleryResponse.meta;

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
    setPage(1);
  };

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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-xs border border-gray-200/80">
              <button
                type="button"
                onClick={() => {
                  setActiveSubView('articles');
                  setSearchParams({});
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubView === 'articles'
                    ? 'bg-hepco-green text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span>Tin tức &amp; Thông báo</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
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
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubView === 'gallery'
                    ? 'bg-hepco-green text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Thư viện Hình ảnh</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Thư viện Hình ảnh Hoạt động</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Tổng hợp hình ảnh thực tế về hoạt động công ty, vệ sinh môi trường, phương tiện thiết bị và các công trình dự án của HEPCO.
                  </p>
                </div>

                {/* Gallery Search */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm hình ảnh..."
                    value={gallerySearch}
                    onChange={(e) => {
                      setGallerySearch(e.target.value);
                      setGalleryPage(1);
                    }}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
                  />
                  {gallerySearch && (
                    <button
                      onClick={() => {
                        setGallerySearch('');
                        setGalleryPage(1);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Gallery Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
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
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
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
            {/* Controls Card: Category, Year, Search & View Mode */}
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-800">{bannerInfo.title}</h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {meta.total} {pageType === 'shareholders' ? 'tài liệu công bố' : 'bài viết'}
                    </span>
                  </div>
                  {pageType === 'shareholders' && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Tra cứu, xem trực tuyến và tải xuống các báo cáo tài chính, nghị quyết và văn bản cổ đông theo từng năm và loại tài liệu.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Box */}
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={
                        pageType === 'shareholders'
                          ? 'Tìm theo tên tài liệu, nghị quyết, báo cáo...'
                          : 'Tìm kiếm bài viết, thông báo...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* View Mode Toggle for Shareholders */}
                  {pageType === 'shareholders' && (
                    <div className="inline-flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setShareholderViewMode('list')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
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
              </div>

              {/* Filter Bar for News Categories */}
              {pageType === 'news' && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  {NEWS_CATEGORY_OPTIONS.map((opt) => {
                    const isActive = selectedCategory === opt.value;
                    const count =
                      opt.value === NEWS_CATEGORY.ALL
                        ? newsStats.total
                        : newsStats.countsByCategory[opt.value] || 0;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(opt.value);
                          setPage(1);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
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
              )}

              {/* Filter Bar for Shareholders: Year Pills + Document Type Selector */}
              {pageType === 'shareholders' && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  {/* Year Filter Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                      <Calendar className="w-3.5 h-3.5 text-hepco-green" /> Năm công bố:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear('all');
                        setPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        selectedYear === 'all'
                          ? 'bg-[#10243b] text-white border-[#10243b]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Tất cả ({shareholderStats.total})
                    </button>
                    {shareholderStats.years.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          setSelectedYear(String(yr));
                          setPage(1);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          String(selectedYear) === String(yr)
                            ? 'bg-hepco-green text-white border-hepco-green shadow-2xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Năm {yr}
                      </button>
                    ))}
                  </div>

                  {/* Document Type Pills Row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                      <Filter className="w-3.5 h-3.5 text-hepco-green" /> Loại tài liệu:
                    </span>
                    {SHAREHOLDER_DOC_TYPE_OPTIONS.map((opt) => {
                      const count =
                        opt.value === SHAREHOLDER_DOC_TYPE.ALL
                          ? shareholderStats.total
                          : shareholderStats.countsByType[opt.value] || 0;
                      if (opt.value !== SHAREHOLDER_DOC_TYPE.ALL && count === 0) return null;
                      const isActive = selectedCategory === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(opt.value);
                            setPage(1);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-hepco-green text-white border-hepco-green shadow-2xs'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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

                                  {/* Attachments List inside Shareholder Card */}
                                  {attachments.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                      {attachments.map((att) => {
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

                                            <div className="flex items-center gap-2 shrink-0">
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
                                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition-all cursor-pointer shadow-2xs"
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
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-hepco-green hover:bg-emerald-700 text-white transition-all shadow-2xs"
                                              >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Tải về</span>
                                              </a>
                                            </div>
                                          </div>
                                        );
                                      })}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                              className="h-56 bg-gray-100 relative overflow-hidden cursor-pointer"
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
                            <div className="p-6 flex-grow flex flex-col justify-between">
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
