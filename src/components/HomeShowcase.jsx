import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const HomeShowcase = () => {
  const showcases = [
    {
      title: 'Đoàn Phương Tiện Chuyên Dụng Thu Gom',
      location: 'Các tuyến đường trục chính, TP. Huế',
      scale: '100+ Xe chuyên dùng',
      tag: 'Phương tiện cơ giới',
      image: '/images/news_trucks.png',
    },
    {
      title: 'Chăm Sóc & Tôn Tạo Công Viên Di Sản',
      location: 'Dọc bờ sông Hương & công viên trung tâm',
      scale: '50+ Hécta thảm cỏ, hoa cảnh',
      tag: 'Cảnh quan xanh',
      image: '/images/news_planting.png',
    },
    {
      title: 'Chiến Dịch Vệ Sinh Môi Trường Đô Thị',
      location: 'Khu vực dân cư & các điểm công cộng',
      scale: 'Hằng ngày & Cao điểm lễ',
      tag: 'Vệ sinh môi trường',
      image: '/images/news_cleanup.png',
    },
    {
      title: 'Họp Điều Hành & Sẵn Sàng Ứng Trực',
      location: 'Trung tâm điều hành HEPCO',
      scale: 'Toàn lực lượng cán bộ công nhân',
      tag: 'Quản lý chất lượng',
      image: '/images/news_meeting.png',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight">
              Hoạt Động &amp; Dự Án Trọng Điểm
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Hình ảnh công tác thực tế của đội ngũ cán bộ công nhân viên HEPCO trên khắp các nẻo đường Cố đô Huế.
            </p>
          </div>

          <Link
            to={ROUTES.NEWS}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-[#10243b] text-[#10243b] hover:text-white font-bold text-sm transition-all duration-300 shadow-2xs group self-start md:self-auto"
          >
            <span>Toàn Bộ Tin Tức &amp; Hoạt Động</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Showcase Grid (Oakdale Style Visual Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {showcases.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col rounded-3xl overflow-hidden bg-[#fafafa] border border-gray-200/90 hover:border-emerald-600/60 shadow-xs hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Frame */}
              <div className="relative h-60 w-full overflow-hidden bg-gray-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Text Meta */}
              <div className="p-6 flex flex-col justify-between flex-grow bg-white">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#10243b] group-hover:text-emerald-700 transition-colors mb-3 line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="font-semibold text-gray-700">
                      Quy mô: <span className="font-normal text-gray-500">{item.scale}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#10243b] group-hover:text-emerald-700">
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeShowcase;
