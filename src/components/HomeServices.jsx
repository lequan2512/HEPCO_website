import { useGetNews } from '../apis/news';
import { API_BASE_URL } from '../constants/api';
import { Link } from 'react-router-dom';

const HomeServices = () => {
  const { data: servicesResponse = {} } = useGetNews({ type: 'service', limit: 4 });
  const rawServices = servicesResponse.data || [];
  
  const apiServices = [...rawServices].sort((a, b) => a.id - b.id);

  return (
    <section className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 inline-block relative">
            Dịch vụ của chúng tôi
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 relative mt-16 lg:mt-0">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-4/5 h-48 bg-gray-300 rounded-t-xl z-10 border-4 border-white shadow-lg overflow-hidden flex items-end justify-center group">
               <img src="/images/news_trucks.png" alt="Dịch vụ HEPCO" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               <div className="w-16 h-16 bg-hepco-green rounded-full border-4 border-white mb-2 absolute -bottom-8 z-20 flex items-center justify-center shadow-md">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
               </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 via-hepco-green to-green-900 rounded-xl p-8 pt-40 text-white shadow-xl h-full relative">
              <span className="text-6xl text-yellow-400 font-serif absolute top-32 left-8">"</span>
              <p className="text-lg leading-relaxed mt-4 text-justify relative z-10">
                HEPCO với kinh nghiệm gần 50 năm kinh nghiệm trong lĩnh vực vệ sinh môi trường và công trình đô thị sẽ cung cấp đến quý khách hàng các dịch vụ với chất lượng tốt nhất, uy tín nhất. Cam kết luôn đồng hành cùng quý khách hàng trong hành trình bảo vệ môi trường và phát triển bền vững.
              </p>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apiServices.map((service, index) => (
                <Link key={service.id || index} to="/dich-vu" state={{ serviceId: service.id }} className="group relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer block">
                  {service.thumbnail ? (
                    <img 
                      src={service.thumbnail.startsWith('http') ? service.thumbnail : `${API_BASE_URL}${service.thumbnail}`} 
                      alt={service.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <img src={['/images/news_cleanup.png', '/images/news_planting.png', '/images/news_meeting.png'][index % 3]} alt={service.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 text-center">
                    <h3 className="text-white font-bold text-lg drop-shadow-md transition-colors group-hover:text-yellow-400">
                      {service.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeServices;
