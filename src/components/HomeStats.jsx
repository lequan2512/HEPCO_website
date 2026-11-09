import { Award, Users, MapPin, Clock3 } from 'lucide-react';

const DEFAULT_STATS = [
  {
    value: '50+',
    label: 'NĂM KINH NGHIỆM',
    description: 'Gần nửa thế kỷ kiến tạo môi trường đô thị Huế',
    icon: Award,
  },
  {
    value: '100K+',
    label: 'HỘ DÂN & DOANH NGHIỆP',
    description: 'Khách hàng tin tưởng và đồng hành mỗi ngày',
    icon: Users,
  },
  {
    value: '100%',
    label: 'ĐỘ PHỦ ĐÔ THỊ',
    description: 'Mạng lưới thu gom và duy tu toàn diện khắp địa bàn',
    icon: MapPin,
  },
  {
    value: '24/7',
    label: 'ỨNG TRỰC & PHỤC VỤ',
    description: 'Sẵn sàng xử lý các sự cố vệ sinh môi trường',
    icon: Clock3,
  },
];

const ICONS = [Award, Users, MapPin, Clock3];

const HomeStats = ({ config }) => {
  const stats = Array.isArray(config) && config.length > 0
    ? config.map((item, idx) => ({
        ...item,
        icon: ICONS[idx % ICONS.length]
      }))
    : DEFAULT_STATS;

  return (
    <section className="bg-white border-b border-gray-200/80 py-10 md:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 divide-y lg:divide-y-0 lg:divide-x divide-gray-200/80">
          {stats.map((item, idx) => {
            const IconComponent = item.icon || Award;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center px-4 ${
                  idx > 0 && idx % 2 === 0 ? 'pt-8 lg:pt-0' : ''
                } ${idx % 2 !== 0 ? 'pt-8 sm:pt-0' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 shadow-xs border border-emerald-100">
                  <IconComponent className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight mb-1">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-800 tracking-wider mb-2 uppercase">
                  {item.label}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 max-w-[220px] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeStats;
