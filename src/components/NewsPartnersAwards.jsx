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
                    <h3 className="text-hepco-green font-extrabold text-lg mb-2 line-clamp-3 leading-snug group-hover:text-hepco-orange transition-colors">
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
        <div className="mb-20">
          <div className="text-center mb-12 relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-green-900 inline-block relative pb-4 uppercase">
              Đối tác & Khách hàng
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
            </h2>
          </div>

          <div className="overflow-hidden w-full relative py-2">
            {/* Gradient masks on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="animate-marquee flex items-center gap-8 sm:gap-12">
              {[
                { img: '/images/partner/benh-vien.jpg', alt: 'Bệnh Viện', round: true },
                { img: '/images/partner/logomgreen.png', alt: 'mGreen', round: false },
                { img: '/images/partner/scavi.jpg', alt: 'Scavi', round: true },
                { img: '/images/partner/toyota.png', alt: 'Toyota', round: false },
                { img: '/images/partner/usaid.jpg', alt: 'USAID', round: true },
                { img: '/images/partner/wwf.webp', alt: 'WWF', round: false },
                { img: '/images/partner/benh-vien.jpg', alt: 'Bệnh Viện', round: true },
                { img: '/images/partner/logomgreen.png', alt: 'mGreen', round: false },
                { img: '/images/partner/scavi.jpg', alt: 'Scavi', round: true },
                { img: '/images/partner/toyota.png', alt: 'Toyota', round: false },
                { img: '/images/partner/usaid.jpg', alt: 'USAID', round: true },
                { img: '/images/partner/wwf.webp', alt: 'WWF', round: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`${item.round ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-full' : 'w-28 sm:w-36 h-14 sm:h-16 rounded-lg'} bg-white flex items-center justify-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 grayscale hover:grayscale-0 overflow-hidden shrink-0 cursor-pointer`}
                >
                  <img src={item.img} alt={item.alt} className="w-full h-full object-contain p-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Awards Section */}
        <div>
          <div className="text-center mb-12 relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-green-900 inline-block relative pb-4 uppercase">
              Thành tích & Khen thưởng
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
            </h2>
          </div>

          <div className="overflow-hidden w-full relative py-2">
            {/* Gradient masks on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="animate-marquee-slow flex items-center gap-5 sm:gap-6">
              {[
                { img: '/images/merit/bang-khen1.jpg', alt: 'Bằng khen 1' },
                { img: '/images/merit/bang-khen2.jpg', alt: 'Bằng khen 2' },
                { img: '/images/merit/bang-khen3.jpg', alt: 'Bằng khen 3' },
                { img: '/images/merit/bang-khen4.jpg', alt: 'Bằng khen 4' },
                { img: '/images/merit/bang-khen5.jpg', alt: 'Bằng khen 5' },
                { img: '/images/merit/bang-khen1.jpg', alt: 'Bằng khen 1' },
                { img: '/images/merit/bang-khen2.jpg', alt: 'Bằng khen 2' },
                { img: '/images/merit/bang-khen3.jpg', alt: 'Bằng khen 3' },
                { img: '/images/merit/bang-khen4.jpg', alt: 'Bằng khen 4' },
                { img: '/images/merit/bang-khen5.jpg', alt: 'Bằng khen 5' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="w-72 sm:w-80 h-52 sm:h-60 bg-white border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-1 shrink-0 flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <img src={item.img} alt={item.alt} className="w-full h-full object-cover p-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsPartnersAwards;
