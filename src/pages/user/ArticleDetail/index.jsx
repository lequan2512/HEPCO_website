import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { API_BASE_URL } from '../../../constants/api';
import Loading from '../../../components/Loading';
import { useGetArticleById } from '../../../apis/news';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading: loading, error: queryError } = useGetArticleById(id);
  const error = queryError ? 'Bài viết không tồn tại hoặc đã bị xóa' : '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
    <div className="bg-gray-50 flex-grow min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-hepco-green mb-6 transition-colors font-medium text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm"
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
            <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-hepco-green" />
                <span>{article.date}</span>
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
            <div className="text-gray-800 text-base md:text-lg leading-relaxed font-light">
              {typeof article.content === 'string' ? (
                <div 
                  className="prose prose-lg max-w-none 
                    prose-p:mb-6 
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-4
                    prose-a:text-hepco-green hover:prose-a:text-hepco-orange
                    prose-strong:text-gray-900
                    prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2
                    prose-blockquote:border-l-4 prose-blockquote:border-hepco-green prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:text-gray-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-lg" 
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                />
              ) : (
                article.content
              )}
            </div>
          </div>

          {/* Footer Sharing */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5"><Share2 className="w-4 h-4" /> Chia sẻ:</span>
              <button className="text-sm font-medium bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm">Facebook</button>
              <button className="text-sm font-medium bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-400 transition-all shadow-sm">Zalo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
