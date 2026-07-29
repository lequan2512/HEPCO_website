import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useGetNews } from '../apis/news';
import { API_BASE_URL } from '../constants/api';

const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const NewsPartnersAwards = () => {
  const navigate = useNavigate();
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

      <div className="container mx-auto px-4 max-w-8xl relative z-10">
        {/* News Section */}
        {news.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-16 relative">
              <h2 className="text-4xl font-extrabold text-green-900 inline-block relative pb-4">
                TIN TỨC NỔI BẬT
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
              </h2>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 flex flex-col group cursor-pointer transition-all duration-500 hover:-translate-y-2"
                onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', item.id))}
              >
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
                  <h3 className="text-hepco-green font-extrabold text-xl mb-2 line-clamp-3 leading-snug group-hover:text-hepco-orange transition-colors">
                     {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-4">
                    {item.author} - {item.category || 'Tin tức'}
                  </p>
                  <p className="text-gray-500 text-sm line-clamp-2 mt-auto leading-relaxed">
                    {typeof item.content === 'string' ? stripHtml(item.content) : 'Click vào để xem chi tiết bài viết...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Partners Section */}
        <div className="mb-24">
          <div className="text-center mb-16 relative">
            <h2 className="text-4xl font-extrabold text-green-900 inline-block relative pb-4 uppercase">
              Đối tác & Khách hàng
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {/* Logos Placeholders */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 grayscale hover:grayscale-0 overflow-hidden">
              <img src="/images/partner/benh-vien.jpg" alt="Bệnh Viện" className="w-full h-full object-contain p-2" />
            </div>
            <div className="w-32 h-16 bg-white flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all rounded-lg border border-gray-100 grayscale hover:grayscale-0 overflow-hidden">
              <img src="/images/partner/logomgreen.png" alt="mGreen" className="w-full h-full object-contain p-2" />
            </div>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 grayscale hover:grayscale-0 overflow-hidden">
              <img src="/images/partner/scavi.jpg" alt="Scavi" className="w-full h-full object-contain p-2" />
            </div>
            <div className="w-40 h-16 bg-white flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all rounded-lg border border-gray-100 grayscale hover:grayscale-0 overflow-hidden">
              <img src="/images/partner/toyota.png" alt="Toyota" className="w-full h-full object-contain p-2" />
            </div>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 grayscale hover:grayscale-0 overflow-hidden">
              <img src="/images/partner/usaid.jpg" alt="USAID" className="w-full h-full object-contain p-2" />
            </div>
            <div className="w-32 h-16 bg-white flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all rounded-lg border border-gray-100 grayscale hover:grayscale-0 overflow-hidden">
              <img src="/images/partner/wwf.webp" alt="WWF" className="w-full h-full object-contain p-2" />
            </div>
          </div>
        </div>

        {/* Awards Section */}
        <div>
          <div className="text-center mb-16 relative">
            <h2 className="text-4xl font-extrabold text-green-900 inline-block relative pb-4 uppercase">
              Thành tích & Khen thưởng
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
            </h2>
          </div>
          <div className="flex justify-start md:justify-center gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-2">
             <div className="w-96 h-64 bg-white border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 flex-shrink-0 flex items-center justify-center snap-center transition-all duration-300 overflow-hidden">
               <img src="/images/merit/bang-khen1.jpg" alt="Bằng khen 1" className="w-full h-full object-contain p-2" />
             </div>
             <div className="w-96 h-64 bg-white border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 flex-shrink-0 flex items-center justify-center snap-center transition-all duration-300 overflow-hidden">
               <img src="/images/merit/bang-khen2.jpg" alt="Bằng khen 2" className="w-full h-full object-contain p-2" />
             </div>
             <div className="w-96 h-64 bg-white border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 flex-shrink-0 flex items-center justify-center snap-center transition-all duration-300 overflow-hidden">
               <img src="/images/merit/bang-khen3.jpg" alt="Bằng khen 3" className="w-full h-full object-contain p-2" />
             </div>
             <div className="w-96 h-64 bg-white border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 flex-shrink-0 flex items-center justify-center snap-center transition-all duration-300 overflow-hidden">
               <img src="/images/merit/bang-khen4.jpg" alt="Bằng khen 4" className="w-full h-full object-contain p-2" />
             </div>
             <div className="w-96 h-64 bg-white border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 flex-shrink-0 flex items-center justify-center snap-center transition-all duration-300 overflow-hidden">
               <img src="/images/merit/bang-khen5.jpg" alt="Bằng khen 5" className="w-full h-full object-contain p-2" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsPartnersAwards;
