import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Paperclip,
  Download,
  Eye,
  FileText,
  ArrowRight,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import PdfFlipbook from '../../../components/PdfFlipbook';
import { useGetArticleById } from '../../../apis/news';
import { ROUTES } from '../../../constants/routes';
import {
  NEWS_CATEGORY_LABELS,
  SHAREHOLDER_DOC_TYPE_LABELS
} from '../../../constants/news';
import { resolveAssetUrl, formatFileSize, sanitizeLegacyHtml } from '../../../utils/assetUrl';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [isPdfClosed, setIsPdfClosed] = useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const [lightboxImgIdx, setLightboxImgIdx] = useState(null);

  const { data: article, isLoading: loading, error: queryError } = useGetArticleById(id);
  const error = queryError ? 'Bài viết không tồn tại hoặc đã bị xóa' : '';

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setActivePdfUrl(null);
    setIsPdfClosed(false);
    setShowAllAttachments(false);
    setLightboxImgIdx(null);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Automatically select first PDF attachment for Shareholder documents for instant inline reading
  const attachments = article?.attachments || [];
  const pdfAttachments = attachments.filter((a) => (a.ext || '').toLowerCase() === 'pdf');
  const effectivePdf = isPdfClosed
    ? null
    : activePdfUrl ||
      (article?.type === 'shareholders' && pdfAttachments.length > 0 ? pdfAttachments[0] : null);
  const visibleAttachments = showAllAttachments ? attachments : attachments.slice(0, 3);

  const handleShareFacebook = () => {
    const shareUrl = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      'facebook-share-dialog',
      'width=600,height=500,location=no,menubar=no'
    );
  };

  const handleShareZalo = () => {
    const shareUrl = encodeURIComponent(window.location.href);
    window.open(
      `https://sp.zalo.me/share_inline?url=${shareUrl}`,
      'zalo-share-dialog',
      'width=600,height=500,location=no,menubar=no'
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Đã sao chép liên kết bài viết!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép liên kết');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: article?.title || 'HEPCO - Bài viết',
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return <Loading fullScreen={true} message="Đang tải bài viết..." />;
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex-grow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h2>
        <p className="text-gray-600 mb-6">
          {error || 'Có thể bài viết đã bị xóa hoặc đường dẫn không chính xác.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-hepco-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang trước
        </button>
      </div>
    );
  }

  const badgeMeta =
    article.type === 'shareholders'
      ? SHAREHOLDER_DOC_TYPE_LABELS[article.documentType]
      : NEWS_CATEGORY_LABELS[article.category];

  const articleImages = article.images || [];
  const relatedArticles = article.relatedArticles || [];

  return (
    <div className="bg-gray-50 flex-grow min-h-screen py-6 sm:py-10 relative">
      {/* 24h.com.vn Desktop Floating Share Bar (Shown on 2xl+ screens so it never overlaps 1280px laptop content) */}
      <div className="hidden 2xl:flex flex-col items-center gap-3 fixed left-6 top-1/3 z-30 bg-white p-2.5 rounded-full shadow-xl border border-gray-100 transition-all">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          Chia sẻ
        </span>

        {/* Facebook Floating Round Icon */}
        <button
          onClick={handleShareFacebook}
          className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#165EBF] hover:scale-110 transition-all shadow-md active:scale-95 cursor-pointer"
          title="Chia sẻ bài viết lên Facebook"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* Zalo Floating Round Icon */}
        <button
          onClick={handleShareZalo}
          className="w-10 h-10 rounded-full bg-[#0068FF] text-white flex items-center justify-center hover:bg-[#0052CC] hover:scale-110 transition-all shadow-md active:scale-95 cursor-pointer"
          title="Chia sẻ bài viết qua Zalo"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.84L2.5 21.5l3.81-1.23A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-5 13.5h-2v-1l2.6-3.25H5.6v-1.25h4v1l-2.6 3.25h2.6v1.25zm4.5 0h-1.25v-5.5h1.25v5.5zm3.25 0c-1.24 0-2.25-1.01-2.25-2.25s1.01-2.25 2.25-2.25 2.25 1.01 2.25 2.25-1.01 2.25-2.25 2.25z" />
          </svg>
        </button>

        {/* Copy Link Floating Round Icon */}
        <button
          onClick={handleCopyLink}
          className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md active:scale-95 cursor-pointer ${
            copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Sao chép liên kết bài viết"
        >
          {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-hepco-green transition-colors font-medium text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          <button
            onClick={() =>
              navigate(article.type === 'shareholders' ? ROUTES.SHAREHOLDERS : ROUTES.NEWS)
            }
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-hepco-green hover:text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <span>
              {article.type === 'shareholders'
                ? 'Tất cả Tài liệu Cổ đông'
                : 'Tất cả Tin tức & Sự kiện'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Article Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
            {/* Category & Year Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              {badgeMeta && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeMeta.bg}`}
                >
                  {article.categoryLabel || article.documentTypeLabel || badgeMeta.label}
                </span>
              )}
              {article.publishYear && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  Năm {article.publishYear}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#10243b] leading-snug mb-4 sm:mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-hepco-green" />
                <span>Ngày đăng: {article.date}</span>
              </div>

              {/* 24h style Top Bar Quick Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400">Chia sẻ:</span>
                <button
                  onClick={handleShareFacebook}
                  className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-xs cursor-pointer"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={handleShareZalo}
                  className="w-8 h-8 rounded-full bg-[#0068FF] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-xs cursor-pointer"
                  title="Zalo"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.84L2.5 21.5l3.81-1.23A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-5 13.5h-2v-1l2.6-3.25H5.6v-1.25h4v1l-2.6 3.25h2.6v1.25zm4.5 0h-1.25v-5.5h1.25v5.5zm3.25 0c-1.24 0-2.25-1.01-2.25-2.25s1.01-2.25 2.25-2.25 2.25 1.01 2.25 2.25-1.01 2.25-2.25 2.25z" />
                  </svg>
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                    copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Sao chép link"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Banner/Thumbnail Image (shown for News articles or when clicked) */}
          {article.thumbnail && article.type !== 'shareholders' && (
            <div
              onClick={() => setLightboxImgIdx(0)}
              className="w-full max-h-[520px] bg-gray-100 relative overflow-hidden cursor-zoom-in"
            >
              <img
                src={resolveAssetUrl(article.thumbnail)}
                alt={article.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/cover.png';
                }}
                className="w-full h-full max-h-[520px] object-cover"
              />
            </div>
          )}

          {/* Attachments Box (PDF, Word, Excel, RAR) */}
          {attachments.length > 0 && (
            <div className="p-4 sm:p-6 md:p-8 bg-emerald-50/40 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-4">
                <h3 className="text-base sm:text-lg font-extrabold text-[#10243b] flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-hepco-green shrink-0" />
                  <span>Tài liệu đính kèm ({attachments.length})</span>
                </h3>
                <span className="text-xs text-gray-500">
                  Nhấn &quot;Xem trực tiếp&quot; để đọc tài liệu ngay trên trang hoặc &quot;Tải về&quot; máy
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {visibleAttachments.map((att) => {
                  const isPdf = (att.ext || '').toLowerCase() === 'pdf';
                  const resolvedUrl = resolveAssetUrl(att.fileUrl);
                  const isSelected = effectivePdf && effectivePdf.id === att.id;
                  const sizeLabel = formatFileSize(att.size);

                  return (
                    <div
                      key={att.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-white border-hepco-green shadow-sm ring-1 ring-hepco-green/30'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-hepco-green shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-bold text-gray-900 break-words">
                            {att.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                              {att.ext || 'PDF'}
                            </span>
                            {sizeLabel && <span>Dung lượng: {sizeLabel}</span>}
                            <span className="truncate max-w-[200px] sm:max-w-xs text-gray-400">{att.fileName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
                        {isPdf && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setIsPdfClosed(true);
                                setActivePdfUrl(null);
                              } else {
                                setIsPdfClosed(false);
                                setActivePdfUrl(att);
                              }
                            }}
                            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#10243b] text-white border-[#10243b]'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Eye className="w-4 h-4 shrink-0" />
                            <span>{isSelected ? 'Ẩn khung xem' : 'Xem trực tiếp'}</span>
                          </button>
                        )}

                        <a
                          href={resolvedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          title="Mở tệp trong tab mới"
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          <span className="hidden md:inline">Mở tab mới</span>
                        </a>

                        <a
                          href={resolvedUrl}
                          download={att.fileName}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-hepco-green hover:bg-emerald-700 text-white shadow-xs transition-all"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          <span>Tải về</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {attachments.length > 3 && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllAttachments((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-hepco-green hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 shadow-2xs transition-all cursor-pointer"
                  >
                    {showAllAttachments ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Thu gọn danh sách tệp đính kèm</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Xem tất cả {attachments.length} tệp đính kèm (+{attachments.length - 3} tệp khác)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Inline PDF Viewer when a PDF attachment is selected */}
              {effectivePdf && (
                <div className="mt-6">
                  <PdfFlipbook
                    pdfUrl={resolveAssetUrl(effectivePdf.fileUrl)}
                    fileName={effectivePdf.fileName}
                    title={effectivePdf.title}
                  />
                </div>
              )}
            </div>
          )}

          {/* Content Body */}
          <div className="p-4 sm:p-6 md:p-10 lg:p-12">
            {/* Main HTML Content */}
            <div className="text-gray-800 text-base md:text-lg leading-relaxed font-normal">
              {typeof article.content === 'string' ? (
                <div
                  className="prose prose-lg max-w-none [word-break:keep-all] [overflow-wrap:break-word]
                    prose-p:mb-6
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-4
                    prose-a:text-hepco-green hover:prose-a:text-hepco-orange prose-a:font-semibold
                    prose-strong:text-gray-900
                    prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto prose-img:my-6
                    prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-gray-300 prose-td:p-2.5 prose-th:border prose-th:border-gray-300 prose-th:p-2.5 prose-th:bg-gray-50
                    prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2
                    prose-blockquote:border-l-4 prose-blockquote:border-hepco-green prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeLegacyHtml(article.content)
                  }}
                />
              ) : (
                article.content
              )}
            </div>

            {/* Article Photo Strip if multiple images exist */}
            {articleImages.length > 1 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h4 className="text-base font-extrabold text-gray-800 mb-4">
                  Hình ảnh trong bài viết ({articleImages.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {articleImages.map((imgObj, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImgIdx(idx)}
                      className="h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-zoom-in group relative"
                    >
                      <img
                        src={resolveAssetUrl(imgObj.url)}
                        alt={imgObj.caption || article.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Sharing (24h.com.vn style) */}
          <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 border-t border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2 mr-2">
                <Share2 className="w-4 h-4 text-hepco-green" /> Chia sẻ bài viết này:
              </span>

              {/* Facebook Button */}
              <button
                onClick={handleShareFacebook}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-[#1877F2] text-white px-4 py-2 rounded-full hover:bg-[#165EBF] hover:shadow-md transition-all active:scale-95 cursor-pointer"
                title="Chia sẻ bài viết lên Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>

              {/* Zalo Button */}
              <button
                onClick={handleShareZalo}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-[#0068FF] text-white px-4 py-2 rounded-full hover:bg-[#0052CC] hover:shadow-md transition-all active:scale-95 cursor-pointer"
                title="Chia sẻ bài viết qua Zalo"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.84L2.5 21.5l3.81-1.23A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-5 13.5h-2v-1l2.6-3.25H5.6v-1.25h4v1l-2.6 3.25h2.6v1.25zm4.5 0h-1.25v-5.5h1.25v5.5zm3.25 0c-1.24 0-2.25-1.01-2.25-2.25s1.01-2.25 2.25-2.25 2.25 1.01 2.25 2.25-1.01 2.25-2.25 2.25z" />
                </svg>
                <span>Zalo</span>
              </button>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 ${
                  copied
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 shadow-xs'
                }`}
                title="Sao chép liên kết bài viết"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>

              {/* Mobile / Native Share Button */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-hepco-green text-white px-4 py-2 rounded-full hover:bg-green-700 hover:shadow-md transition-all active:scale-95 md:hidden cursor-pointer"
                  title="Chia sẻ qua ứng dụng khác"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Ứng dụng khác</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#10243b]">
                {article.type === 'shareholders'
                  ? 'Tài liệu cổ đông liên quan'
                  : 'Bài viết liên quan'}
              </h2>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    article.type === 'shareholders' ? ROUTES.SHAREHOLDERS : ROUTES.NEWS
                  )
                }
                className="text-xs sm:text-sm font-bold text-hepco-green hover:text-hepco-orange flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', rel.id))}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img
                      src={resolveAssetUrl(rel.thumbnail)}
                      alt={rel.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/cover.png';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                        <Calendar className="w-3.5 h-3.5 text-hepco-green" />
                        <span>{rel.date}</span>
                      </div>
                      <h3 className="text-gray-900 font-bold text-base line-clamp-2 group-hover:text-hepco-green transition-colors">
                        {rel.title}
                      </h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#10243b] group-hover:text-hepco-green">
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for Article Images */}
      {lightboxImgIdx !== null && articleImages[lightboxImgIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none"
          onClick={() => setLightboxImgIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImgIdx(null)}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/15 hover:bg-rose-600 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {articleImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImgIdx(
                    (prev) => (prev - 1 + articleImages.length) % articleImages.length
                  );
                }}
                className="absolute left-4 z-20 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImgIdx((prev) => (prev + 1) % articleImages.length);
                }}
                className="absolute right-4 z-20 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveAssetUrl(articleImages[lightboxImgIdx].url)}
              alt={article.title}
              className="max-h-[78vh] w-auto object-contain rounded-xl shadow-2xl"
            />
            <p className="text-white text-xs sm:text-sm font-semibold mt-3 text-center">
              {article.title} ({lightboxImgIdx + 1}/{articleImages.length})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
