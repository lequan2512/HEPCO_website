import { ShieldCheck, Truck, Users2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const DEFAULT_POINTS = [
  {
    title: 'Phương Tiện Hiện Đại',
    description:
      'Hơn 100 xe cuốn ép rác, xe tưới rửa đường và xe thang chuyên dụng đạt chuẩn kỹ thuật, hoạt động êm ái và sạch sẽ.',
    icon: Truck,
    badge: 'Công nghệ tiên tiến',
  },
  {
    title: 'Đội Ngũ 1.000+ Nhân Sự',
    description:
      'Cán bộ, công nhân lành nghề, tận tụy gắn bó và sẵn sàng ứng trực cả ngày lẫn đêm, kể cả dịp lễ tết và thời tiết bất lợi.',
    icon: Users2,
    badge: 'Chuyên nghiệp',
  },
  {
    title: 'Kịp Thời & Đúng Tiến Độ',
    description:
      'Thực hiện chuẩn xác theo lộ trình; hệ thống tiếp nhận phản ánh trực tuyến phản hồi và xử lý nhanh chóng trong ngày.',
    icon: Clock,
    badge: 'Ứng trực 24/7',
  },
  {
    title: 'Uy Tín Gần 50 Năm',
    description:
      'Đơn vị công ích chủ lực gìn giữ môi trường và mỹ quan đô thị Cố đô Huế với hệ thống quản lý chất lượng toàn diện.',
    icon: ShieldCheck,
    badge: 'Thương hiệu vững bền',
  },
];

const ICONS = [Truck, Users2, Clock, ShieldCheck];

const HomeWhyChoose = ({ config }) => {
  const title = config?.title || 'Vì Sao Khách Hàng Luôn Tin Chọn HEPCO?';
  const subtitle = config?.subtitle || 'Năng lực vượt trội, cam kết chất lượng và tinh thần trách nhiệm phụng sự xã hội';
  const points = Array.isArray(config?.items) && config.items.length > 0
    ? config.items.map((pt, idx) => ({
        ...pt,
        icon: ICONS[idx % ICONS.length]
      }))
    : DEFAULT_POINTS;

  return (
    <section className="py-20 md:py-28 bg-white border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight text-balance">
              {title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          <Link
            to={ROUTES.ABOUT}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-[#10243b] text-[#10243b] hover:text-white font-bold text-sm transition-all duration-300 shadow-2xs group self-start md:self-auto"
          >
            <span>Tìm Hiểu Về HEPCO</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Feature Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((point, idx) => {
            const IconComponent = point.icon || ShieldCheck;
            return (
              <div
                key={idx}
                className="group flex flex-col justify-between p-8 rounded-3xl bg-[#fafafa] border border-gray-200/90 hover:border-emerald-600/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-gray-100 flex items-center justify-center text-emerald-700 mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7" />
                  </div>

                  {point.badge && (
                    <div className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2">
                      {point.badge}
                    </div>
                  )}

                  <h3 className="text-lg sm:text-xl font-black text-[#10243b] group-hover:text-emerald-700 transition-colors mb-3">
                    {point.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed font-normal">
                    {point.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-200/60 flex items-center gap-2 text-xs font-bold text-[#10243b]">
                  <span>Cam kết chất lượng</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeWhyChoose;
