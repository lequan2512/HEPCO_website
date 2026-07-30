import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, X, Tag } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import Loading from '../../../components/Loading';
import { ROUTES } from '../../../constants/routes';
import { API_BASE_URL } from '../../../constants/api';
import { useGetInfiniteNews } from '../../../apis/news';

const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const FALLBACK_NEWS_DATA = [
  {
    id: 1,
    title: 'HEPCO đồng hành cùng ngày hội "Chủ Nhật Xanh" dọn sạch rác thải dọc hai bờ sông Hương',
    type: 'news',
    date: '14-06-2026',
    thumbnail: '/images/news_cleanup.png',
    content: (
      <>
        <p className="mb-4">
          Sáng ngày 14/06/2026, Công ty Cổ phần Môi trường và Công trình Đô thị Huế (HEPCO) đã phối hợp cùng Đoàn Thanh niên Thành phố Huế tổ chức ra quân chiến dịch <strong>"Ngày Chủ Nhật Xanh - Vì một Huế xanh - sạch - sáng"</strong>. Hoạt động thu hút sự tham gia tích cực của hơn 200 cán bộ, công nhân viên và đoàn viên thanh niên công ty.
        </p>
        <p className="mb-4">
          Tại buổi ra quân, các lực lượng đã tập trung thu gom rác thải, phế thải xây dựng, xóa quảng cáo rao vặt trái phép và làm sạch cỏ dại tại khu vực công viên dọc hai bờ sông Hương, đoạn từ cầu Trường Tiền đến cầu Dã Viên. Đây là khu vực trọng điểm thu hút đông đảo khách du lịch và người dân địa phương đến vui chơi, tập thể dục hàng ngày.
        </p>
        <blockquote className="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">
          "Giữ gìn cảnh quan sông Hương không chỉ là trách nhiệm chuyên môn của HEPCO mà còn là tình yêu của mỗi người con xứ Huế gửi gắm vào dòng sông di sản này." - Đại diện Ban Truyền Thông công ty chia sẻ.
        </blockquote>
        <p className="mb-4">
          Kết quả sau một buổi sáng làm việc khẩn trương và trách nhiệm, hơn 5 tấn rác thải các loại (chủ yếu là túi nilon, chai nhựa và rác thải sinh hoạt do du khách bỏ lại) đã được thu gom, phân loại và vận chuyển về nhà máy xử lý rác theo đúng quy định.
        </p>
        <p>
          Thông qua hoạt động lần này, HEPCO mong muốn lan tỏa mạnh mẽ thông điệp bảo vệ môi trường, nâng cao ý thức giữ gìn vệ sinh nơi công cộng của cộng đồng, góp phần xây dựng Thừa Thiên Huế trở thành đô thị di sản trực thuộc Trung ương theo hướng xanh, sạch, bền vững.
        </p>
      </>
    )
  },
  {
    id: 2,
    title: 'HEPCO đưa vào vận hành dàn xe ép rác chuyên dụng thế hệ mới, giảm thiểu tiếng ồn và khí thải',
    type: 'news',
    date: '18-06-2026',
    thumbnail: '/images/news_trucks.png',
    content: (
      <>
        <p className="mb-4">
          Để đáp ứng yêu cầu ngày càng cao về bảo vệ môi trường và mỹ quan đô thị của thành phố du lịch Huế, vừa qua, Công ty Cổ phần Môi trường và Công trình Đô thị Huế (HEPCO) đã tổ chức bàn giao và đưa vào vận hành dàn xe cuốn ép rác chuyên dùng thế hệ mới cực kỳ hiện đại.
        </p>
        <p className="mb-4">
          Dàn xe mới bao gồm các dòng xe chuyên dùng có tải trọng từ 5 tấn đến 15 tấn, được nhập khẩu và lắp ráp với công nghệ ép thủy lực tiên tiến nhất. Điểm nổi bật của loạt xe này là trang bị động cơ đạt tiêu chuẩn khí thải Euro 5 thân thiện với môi trường, hệ thống gioăng cao su chống rò rỉ nước rác tuyệt đối và buồng ép kín giảm thiểu tối đa mùi hôi phát tán ra không khí trong quá trình di chuyển.
        </p>
        <p className="mb-4">
          Đặc biệt, hệ thống động cơ và bơm thủy lực được tối ưu hóa giúp giảm tiếng ồn vận hành xuống dưới 65dB. Điều này giúp giải quyết triệt để tình trạng tiếng ồn động cơ ảnh hưởng đến giấc ngủ của người dân tại các khu dân cư khi xe thực hiện thu gom rác vào ban đêm.
        </p>
        <blockquote className="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">
          "Việc đầu tư dàn xe chuyên dụng mới là một phần trong lộ trình chuyển đổi xanh của HEPCO, nhằm hướng tới một quy trình thu gom rác thông minh, không tiếng ồn, không phát thải mùi hôi tại thành phố Huế." - Trưởng Phòng Kỹ thuật HEPCO cho biết.
        </blockquote>
        <p>
          Trong thời gian tới, các xe này sẽ được ưu tiên phân bổ tại các tuyến phố đi bộ trung tâm, khu vực quanh Đại Nội và các phường nội thành để đảm bảo chất lượng phục vụ tốt nhất cho Festival Huế và các mùa lễ hội du lịch cao điểm.
        </p>
      </>
    )
  },
  {
    id: 3,
    title: 'Xanh hóa Cố đô: HEPCO ra quân trồng hơn 1.000 cây xanh và hoa trang trí quanh Đại Nội Huế',
    type: 'news',
    date: '10-06-2026',
    thumbnail: '/images/news_planting.png',
    content: (
      <>
        <p className="mb-4">
          Thực hiện chỉ đạo của Ủy ban Nhân dân tỉnh về việc chỉnh trang đô thị, Đội Công viên Cây xanh thuộc HEPCO đã đồng loạt ra quân triển khai dự án cải tạo cảnh quan, trồng mới hơn 1.000 cây xanh đô thị và hàng vạn khóm hoa trang trí tại các khu vực trọng điểm quanh Kinh thành Huế.
        </p>
        <p className="mb-4">
          Các loại cây được chọn trồng đợt này chủ yếu là cây bản địa có hoa đẹp, tán rộng như Phượng vàng, Ngô đồng, Muồng hoàng yến và Bằng lăng nước. Đây là các loại cây vừa có khả năng thích nghi tốt với thời tiết khắc nghiệt của Huế, vừa giữ gìn nét đặc trưng văn hóa lịch sử của vùng đất cố đô.
        </p>
        <p className="mb-4">
          Song song với việc trồng cây bóng mát, các công nhân lành nghề của HEPCO cũng đã kiến thiết lại các bồn hoa, dải phân cách dọc đường Đoàn Thị Điểm, 23 Tháng 8, Lê Huân bằng các loài hoa rực rỡ như hoa giấy ngũ sắc, chiều tím, ngũ sắc thân gỗ... được sắp xếp thành các thảm hoa nghệ thuật uốn lượn đẹp mắt.
        </p>
        <blockquote className="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">
          "Mỗi cây xanh được trồng xuống là một lá phổi xanh mới cho thành phố. Chúng tôi hy vọng sự chăm chút tỉ mỉ này sẽ giúp du khách cảm thấy thư thái và ấn tượng hơn khi dạo bước ngắm nhìn Hoàng cung cổ kính." - Tổ trưởng tổ vườn hoa chia sẻ.
        </blockquote>
        <p>
          Đề án trồng cây xanh và chỉnh trang cảnh quan đô thị dự kiến sẽ hoàn thành trước cuối tháng 6/2026, mang lại diện mạo xanh mát, thơ mộng chào đón hàng triệu du khách đến với Huế trong dịp hè này.
        </p>
      </>
    )
  },
  {
    id: 4,
    title: 'Đại hội đồng Cổ đông thường niên năm 2026 của HEPCO thành công tốt đẹp',
    type: 'shareholders',
    date: '28-05-2026',
    thumbnail: '/images/news_meeting.png',
    content: (
      <>
        <p className="mb-4">
          Vào sáng ngày 28/05/2026, tại Hội trường Khách sạn Hương Giang (TP. Huế), Công ty Cổ phần Môi trường và Công trình Đô thị Huế (mã chứng khoán: HEP) đã long trọng tổ chức Đại hội đồng Cổ đông thường niên năm 2026. Đại hội có sự tham dự của các cổ đông đại diện cho hơn 90% số cổ phần có quyền biểu quyết.
        </p>
        <p className="mb-4">
          Báo cáo tại Đại hội, Ban điều hành HEPCO cho biết trong năm tài chính vừa qua, mặc dù gặp nhiều khó khăn chung của nền kinh tế, công ty vẫn hoàn thành xuất sắc các chỉ tiêu kế hoạch kinh doanh được giao. Tổng doanh thu đạt hơn 350 tỷ đồng, lợi nhuận sau thuế đạt 24,5 tỷ đồng, tỷ lệ chia cổ tức bằng tiền mặt dự kiến là 10%.
        </p>
        <p className="mb-4">
          Về định hướng phát triển năm 2026, HĐQT đề ra mục tiêu tăng trưởng doanh thu tối thiểu 12%, đẩy mạnh chuyển đổi số trong quản lý vận hành xe rác bằng định vị GPS thông minh, đầu tư nâng công suất nhà máy phân loại xử lý rác thải hữu cơ sản xuất phân vi sinh hữu cơ chất lượng cao.
        </p>
        <blockquote className="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">
          "Đại hội đồng Cổ đông 2026 ghi dấu bước chuyển mình quan trọng của HEPCO sang mô hình kinh tế tuần hoàn, không chỉ làm sạch thành phố mà còn biến rác thải thành tài nguyên sinh lợi cho xã hội và cổ đông." - Chủ tịch HĐQT nhấn mạnh.
        </blockquote>
        <p>
          Đại hội đã tiến hành biểu quyết biểu quyết thông qua các tờ trình quan trọng với tỷ lệ nhất trí cao 100%, bầu bổ sung thành viên Ban Kiểm soát nhiệm kỳ mới và kết thúc thành công tốt đẹp vào lúc 11h30 cùng ngày.
        </p>
      </>
    )
  }
];

const News = ({ pageType = 'news' }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const observer = useRef();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const bannerInfo = pageType === 'news'
    ? { title: "Tin tức & Sự kiện", description: "Cập nhật những thông tin mới nhất về hoạt động và sự kiện của HEPCO." }
    : { title: "Thông tin Cổ đông", description: "Cập nhật các báo cáo, thông cáo và thông tin dành cho cổ đông của HEPCO." };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
    isError
  } = useGetInfiniteNews({ type: pageType, limit: 9, search: debouncedSearch });

  const articles = useMemo(() => {
    if (isError) return FALLBACK_NEWS_DATA;
    if (!data) return [];
    return data.pages.flatMap((page) => page.data || []);
  }, [data, isError]);

  const lastElementRef = useCallback(node => {
    if (loading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Articles
  const filteredArticles = articles;

  return (
    <div className="bg-gray-50 pb-20 flex-grow min-h-screen">
      <PageBanner
        title={bannerInfo.title}
        description={bannerInfo.description}
      />

      <div className="container mx-auto px-2.5 sm:px-4 max-w-8xl mt-6 sm:mt-8 md:mt-10">
        {/* Controls Layout: Category & Search bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8 bg-white p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">

          {/* Left spacing if needed, but since we removed categories, just a title or empty div to push search right */}
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-gray-800">{bannerInfo.title}</h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Articles List or Empty State */}
        {loading ? (
          <Loading message="Đang tải danh sách bài viết..." />
        ) : filteredArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <div
                  key={article.id}
                  ref={index === filteredArticles.length - 1 ? lastElementRef : null}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Section */}
                  <div
                    className="h-56 bg-gray-100 relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', article.id))}
                  >
                    <img
                      src={article.thumbnail?.startsWith('http') ? article.thumbnail : `${API_BASE_URL}${article.thumbnail}`}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge over image */}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-hepco-green font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                      {pageType === 'news' ? 'Tin Mới' : 'Quan Hệ Cổ Đông'}
                    </span>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{article.date}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-gray-900 font-bold text-lg mb-3 line-clamp-2 leading-snug cursor-pointer group-hover:text-hepco-orange transition-colors"
                        onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', article.id))}
                      >
                        {article.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {typeof article.content === 'string' ? stripHtml(article.content) : 'Click vào để xem chi tiết bài viết...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center mt-12 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hepco-green"></div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy bài viết nào</h3>
            <p className="text-gray-500 text-sm px-6">
              Không tìm thấy kết quả nào phù hợp với danh mục hoặc từ khóa tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc nhập từ khóa khác.
            </p>
            <button
              onClick={() => { handleClearSearch(); }}
              className="mt-6 bg-hepco-green text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 shadow-md transition-all"
            >
              Reset bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
