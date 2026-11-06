import { useGetNews } from '../apis/news';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    <section className="py-12 md:py-16 bg-white border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header (Oakdale Editorial Style) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-7 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#10243b] tracking-tight leading-tight">
              Lĩnh vực hoạt động
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Các dịch vụ vệ sinh môi trường và công trình đô thị dành cho người dân, cơ quan và doanh nghiệp.
            </p>
          </div>

          <Link
            to={ROUTES.SERVICES}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-[#10243b] text-[#10243b] hover:text-white font-bold text-sm transition-all duration-300 shadow-2xs group self-start md:self-auto"
          >
            <span>Tất cả dịch vụ</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Services Showcase Cards (Oakdale Style High-Impact Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {displayServices.map((service, index) => {
            const imageSrc = service.thumbnail
              ? resolveAssetUrl(service.thumbnail)
              : FALLBACK_SERVICES[index % FALLBACK_SERVICES.length].thumbnail;

            return (
              <Link
                key={service.id || index}
                to={ROUTES.SERVICES}
                state={{ serviceId: service.id }}
                className="group flex flex-col rounded-xl overflow-hidden bg-[#fafafa] border border-gray-200/90 hover:border-emerald-600/60 transition-colors"
              >
                {/* Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <img
                    src={imageSrc}
                    alt={service.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_SERVICES[index % FALLBACK_SERVICES.length].thumbnail;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>

                {/* Content Details */}
                <div className="p-5 flex flex-col justify-between flex-grow bg-white">
                  <div>
                    <h3 className="text-lg font-semibold text-[#10243b] group-hover:text-emerald-700 transition-colors mb-3 line-clamp-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal mb-6 line-clamp-3">
                      {service.summary ||
                        'Dịch vụ chuyên nghiệp với quy trình chuẩn hóa, đội ngũ nhân sự tận tâm và cam kết bảo vệ môi trường cao nhất.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold text-[#10243b] group-hover:text-emerald-700 transition-colors">
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
