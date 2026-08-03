import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Copy, Check, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../constants/api';
import Loading from '../../../components/Loading';
import { useGetArticleById } from '../../../apis/news';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data: article, isLoading: loading, error: queryError } = useGetArticleById(id);
  const error = queryError ? 'Bài viết không tồn tại hoặc đã bị xóa' : '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
          url: window.location.href,
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
        <p className="text-gray-600 mb-6">{error || 'Có thể bài viết đã bị xóa hoặc đường dẫn không chính xác.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-hepco-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang trước
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex-grow min-h-screen py-10 relative">
      {/* 24h.com.vn Desktop Floating Share Bar */}
      <div className="hidden xl:flex flex-col items-center gap-3 fixed left-6 top-1/3 z-30 bg-white p-2.5 rounded-full shadow-xl border border-gray-100 transition-all">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Chia sẻ</span>

        {/* Facebook Floating Round Icon */}
        <button
          onClick={handleShareFacebook}
          className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#165EBF] hover:scale-110 transition-all shadow-md active:scale-95 cursor-pointer"
          title="Chia sẻ bài viết lên Facebook"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* Zalo Floating Round Icon */}
        <button
          onClick={handleShareZalo}
          className="w-10 h-10 rounded-full bg-[#0068FF] text-white flex items-center justify-center hover:bg-[#0052CC] hover:scale-110 transition-all shadow-md active:scale-95 cursor-pointer"
          title="Chia sẻ bài viết qua Zalo"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.84L2.5 21.5l3.81-1.23A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-5 13.5h-2v-1l2.6-3.25H5.6v-1.25h4v1l-2.6 3.25h2.6v1.25zm4.5 0h-1.25v-5.5h1.25v5.5zm3.25 0c-1.24 0-2.25-1.01-2.25-2.25s1.01-2.25 2.25-2.25 2.25 1.01 2.25 2.25-1.01 2.25-2.25 2.25z"/>
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
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-hepco-green mb-6 transition-colors font-medium text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Article Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-hepco-green" />
                <span>{article.date}</span>
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
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={handleShareZalo}
                  className="w-8 h-8 rounded-full bg-[#0068FF] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-xs cursor-pointer"
                  title="Zalo"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.84L2.5 21.5l3.81-1.23A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-5 13.5h-2v-1l2.6-3.25H5.6v-1.25h4v1l-2.6 3.25h2.6v1.25zm4.5 0h-1.25v-5.5h1.25v5.5zm3.25 0c-1.24 0-2.25-1.01-2.25-2.25s1.01-2.25 2.25-2.25 2.25 1.01 2.25 2.25-1.01 2.25-2.25 2.25z"/>
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

          {/* Banner/Thumbnail Image */}
          {article.thumbnail && (
            <div className="w-full bg-gray-100 relative overflow-hidden">
              <img
                src={article.thumbnail.startsWith('http') ? article.thumbnail : `${API_BASE_URL}${article.thumbnail}`}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Body */}
          <div className="p-8 md:p-12">
            {/* Main HTML Content */}
            <div className="text-gray-800 text-base md:text-lg leading-relaxed font-normal">
              {typeof article.content === 'string' ? (
                <div
                  className="prose prose-lg max-w-none [word-break:keep-all] [overflow-wrap:break-word]
                    prose-p:mb-6
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-4
                    prose-a:text-hepco-green hover:prose-a:text-hepco-orange
                    prose-strong:text-gray-900
                    prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2
                    prose-blockquote:border-l-4 prose-blockquote:border-hepco-green prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg"
                  dangerouslySetInnerHTML={{
                    __html: article.content
                      .replace(/&nbsp;|\u00a0/g, ' ')
                      .replace(/(https?:\/\/[^\s"'<>]+)?(https:\/\/res\.cloudinary\.com\/[^\s"'<>]+)/g, '$2')
                  }}
                />
              ) : (
                article.content
              )}
            </div>
          </div>

          {/* Footer Sharing (24h.com.vn style) */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
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
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.84L2.5 21.5l3.81-1.23A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-5 13.5h-2v-1l2.6-3.25H5.6v-1.25h4v1l-2.6 3.25h2.6v1.25zm4.5 0h-1.25v-5.5h1.25v5.5zm3.25 0c-1.24 0-2.25-1.01-2.25-2.25s1.01-2.25 2.25-2.25 2.25 1.01 2.25 2.25-1.01 2.25-2.25 2.25z"/>
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
      </div>
    </div>
  );
};

export default ArticleDetail;
