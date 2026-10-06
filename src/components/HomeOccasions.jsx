import { Building2, Factory, PartyPopper, Trees } from 'lucide-react';

const HomeOccasions = () => {
  const occasions = [
    {
      title: 'Đô Thị & Khu Dân Cư',
      subtitle: 'Môi trường sống sạch đẹp mỗi ngày',
      description:
        'Hệ thống thu gom rác sinh hoạt định kỳ, quét dọn đường phố và duy tu cảnh quan cho hơn 100.000 hộ gia đình trên toàn địa bàn.',
      icon: Building2,
      tag: 'Cộng đồng',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      title: 'Khu Công Nghiệp & Nhà Máy',
      subtitle: 'Giải pháp xử lý chuẩn quy định',
      description:
        'Thu gom, vận chuyển chất thải công nghiệp thông thường, hút bùn thải và cung cấp dịch vụ vệ sinh chuyên sâu cho doanh nghiệp.',
      icon: Factory,
      tag: 'Doanh nghiệp',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      title: 'Lễ Hội & Sự Kiện Tầm Cỡ',
      subtitle: 'Bảo đảm mỹ quan cho sự kiện lớn',
      description:
        'Phương án ứng trực vệ sinh 24/7, cung ứng nhà vệ sinh lưu động cao cấp và thu dọn hiện trường cho Festival Huế và các lễ hội văn hóa.',
      icon: PartyPopper,
      tag: 'Sự kiện & Du lịch',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Cảnh Quan & Công Trình Xanh',
      subtitle: 'Kiến tạo không gian xanh di sản',
      description:
        'Chăm sóc hệ thống công viên bờ sông Hương, cắt tỉa cành cây phòng chống bão lũ và vận hành mạng lưới chiếu sáng công cộng hiện đại.',
      icon: Trees,
      tag: 'Cảnh quan di sản',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#f8fafc] border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight mb-4">
            Phục Vụ Đa Dạng Nhu Cầu &amp; Quy Mô
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Bất kể là khu dân cư, doanh nghiệp sản xuất hay lễ hội quy mô quốc tế, HEPCO luôn có phương án vận hành tối ưu nhất.
          </p>
        </div>

        {/* 4 Cards Grid (Oakdale Style Minimal Clean Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {occasions.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-7 rounded-3xl bg-white border border-gray-200 hover:border-emerald-600/50 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#10243b] group-hover:text-emerald-700 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800/80 mb-3">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed font-normal">
                    {item.description}
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

export default HomeOccasions;
