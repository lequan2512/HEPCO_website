import { ShieldCheck, Truck, Users2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const HomeWhyChoose = () => {
  const points = [
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

  return (
    <section className="py-20 md:py-28 bg-white border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight">
              Vì Sao Khách Hàng Luôn Tin Chọn HEPCO?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Sự tin cậy được xây dựng qua gần nửa thế kỷ phụng sự cộng đồng, bảo đảm mỹ quan đô thị và môi trường sống trong lành.
            </p>
          </div>

          <Link
            to={ROUTES.ABOUT}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#10243b] hover:bg-emerald-700 text-white font-bold text-sm transition-all duration-300 shadow-sm hover:shadow-lg group self-start md:self-auto"
          >
            <span>Về Chúng Tôi</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-3xl bg-[#fafafa] border border-gray-200/90 hover:border-emerald-600/50 hover:bg-white shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-emerald-50 border border-gray-200 group-hover:border-emerald-200 text-[#10243b] group-hover:text-emerald-700 flex items-center justify-center transition-colors mb-6 shadow-2xs">
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 mb-2">
                    {point.badge}
                  </span>

                  <h3 className="text-xl font-black text-[#10243b] mb-3 group-hover:text-emerald-700 transition-colors">
                    {point.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed font-normal">
                    {point.description}
                  </p>
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
