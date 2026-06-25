import { useGetNews } from '../apis/news';
import { API_BASE_URL } from '../constants/api';

const NewsPartnersAwards = () => {
  const { data: newsResponse = {} } = useGetNews({ type: 'news', limit: 3 });
  const news = newsResponse.data || [];

  return (
    <section className="py-20 relative bg-white overflow-hidden">
      {/* Background shape */}
      <div className="absolute inset-0 z-0">
        <svg className="absolute w-full h-[150%] top-[-20%] right-[-30%] opacity-10 text-hepco-green" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* News Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tin tức nổi bật</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col group cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                   {item.thumbnail ? (
                     <img 
                       src={item.thumbnail?.startsWith('http') ? item.thumbnail : `${API_BASE_URL}${item.thumbnail}`} 
                       alt={item.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center font-bold text-hepco-green">
                       HEPCO News
                     </div>
                   )}
                   <div className="absolute inset-0 bg-black/5 group-hover:scale-105 transition-transform duration-500"></div>
                   <div className="absolute bottom-[-16px] left-1/2 transform -translate-x-1/2 bg-hepco-green text-white text-xs font-bold py-1 px-4 rounded-full z-10 whitespace-nowrap">
                     {item.date}
                   </div>
                </div>
                <div className="p-8 pt-8 flex-grow flex flex-col">
                  <h3 className="text-hepco-orange font-bold text-lg mb-2 line-clamp-3 leading-snug group-hover:text-orange-600 transition-colors">
                     {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-4">
                    {item.author} - {item.category || 'Tin tức'}
                  </p>
                  <p className="text-gray-500 text-sm line-clamp-3 mt-auto">
                    Đọc chi tiết bài viết để tìm hiểu thêm các thông tin hoạt động mới nhất của HEPCO...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 inline-block relative">
              Đối tác & Khách hàng
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {/* Logos Placeholders */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400">Logo 1</div>
            <div className="w-32 h-16 bg-gray-200 flex items-center justify-center font-bold text-gray-400">Logo 2</div>
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400">Logo 3</div>
            <div className="w-40 h-12 bg-gray-200 flex items-center justify-center font-bold text-gray-400">Logo 4</div>
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400">Logo 5</div>
          </div>
        </div>

        {/* Awards Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Thành tích & Khen thưởng</h2>
          </div>
          <div className="flex justify-start md:justify-center gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-2">
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center snap-center">Bằng khen 1</div>
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center snap-center">Bằng khen 2</div>
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center snap-center">Bằng khen 3</div>
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center snap-center">Bằng khen 4</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsPartnersAwards;
