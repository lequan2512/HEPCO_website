import { useGetNews } from '../apis/news';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { resolveAssetUrl } from '../utils/assetUrl';

const FALLBACK_SERVICES = [
  {
    id: 127,
    title: 'Thu gom, vận chuyển và xử lý rác',
    summary: 'Thu gom rác sinh hoạt, chất thải rắn công nghiệp và chất thải nguy hại trên địa bàn TP. Huế với đội xe cuốn ép hiện đại.',
    thumbnail: '/images/services/thu-gom-rac-1.jpg',
    tag: 'Dịch vụ chính',
  },
  {
    id: 126,
    title: 'Tưới nước rửa đường',
    summary: 'Phun nước rửa đường bằng xe bồn chuyên dụng áp lực cao, giảm bụi và đảm bảo mỹ quan đô thị xanh - sạch - sáng.',
    thumbnail: '/images/services/tuoi-nuoc-rua-duong-1.jpg',
    tag: 'Vệ sinh đô thị',
  },
  {
    id: 47,
    title: 'Nghĩa trang và dịch vụ đưa tang, mai táng',
    summary: 'Quản lý, chăm sóc cảnh quan nghĩa trang và cung cấp trọn gói dịch vụ mai táng, cải táng chu đáo, trang nghiêm.',
    thumbnail: '/images/services/quan-ly-nghia-trang-1.jpg',
    tag: 'Dịch vụ công ích',
  },
  {
    id: 44,
    title: 'Hút Hầm Vệ Sinh - Xử Lý Phân Hầm Cầu',
    summary: 'Dịch vụ hút hầm vệ sinh bằng xe bồn chuyên dụng công nghệ Nhật Bản, thi công nhanh gọn, an toàn và hợp vệ sinh.',
    thumbnail: '/images/services/hut-ham-ve-sinh-1.jpg',
    tag: 'Hạ tầng vệ sinh',
  },
];

const HomeServices = () => {
  const { data: servicesResponse = {} } = useGetNews({ type: 'service', limit: 4 });
  const rawServices = servicesResponse.data || [];
  const displayServices = rawServices.length > 0 ? rawServices : FALLBACK_SERVICES;

  return (
    <section className="py-20 md:py-28 bg-white border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header (Oakdale Editorial Style) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight text-balance">
              Giải Pháp Môi Trường &amp; <span className="inline-block whitespace-nowrap">Hạ Tầng Đô Thị</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Đáp ứng trọn gói nhu cầu của người dân, cơ quan, doanh nghiệp và các sự kiện lớn trên địa bàn tỉnh Thừa Thiên Huế.
            </p>
          </div>

          <Link
            to={ROUTES.SERVICES}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-[#10243b] text-[#10243b] hover:text-white font-bold text-sm transition-all duration-300 shadow-2xs group self-start md:self-auto"
          >
            <span>Tất Cả Dịch Vụ</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Services Showcase Cards (Oakdale Style High-Impact Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {displayServices.map((service, index) => {
            const imageSrc = service.thumbnail
              ? resolveAssetUrl(service.thumbnail)
              : FALLBACK_SERVICES[index % FALLBACK_SERVICES.length].thumbnail;

            return (
              <Link
                key={service.id || index}
                to={ROUTES.SERVICES}
                state={{ serviceId: service.id }}
                className="group flex flex-col rounded-3xl overflow-hidden bg-[#fafafa] border border-gray-200/90 hover:border-emerald-600/60 shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-200">
                  <img
                    src={imageSrc}
                    alt={service.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_SERVICES[index % FALLBACK_SERVICES.length].thumbnail;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>

                {/* Content Details */}
                <div className="p-7 sm:p-8 flex flex-col justify-between flex-grow bg-white">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#10243b] group-hover:text-emerald-700 transition-colors mb-3 line-clamp-2">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal mb-6 line-clamp-3">
                      {service.summary ||
                        'Dịch vụ chuyên nghiệp với quy trình chuẩn hóa, đội ngũ nhân sự tận tâm và cam kết bảo vệ môi trường cao nhất.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-[#10243b] group-hover:text-emerald-700 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đảm bảo an toàn &amp; vệ sinh</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 font-bold group-hover:translate-x-1 transition-transform">
                      <span>Chi tiết</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeServices;
