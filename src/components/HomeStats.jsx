import { Award, Users, MapPin, Clock3 } from 'lucide-react';

const HomeStats = () => {
  const stats = [
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

  return (
    <section className="bg-white border-b border-gray-200/80 py-10 md:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 divide-y lg:divide-y-0 lg:divide-x divide-gray-200/80">
          {stats.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center px-4 ${
                  idx > 0 && idx % 2 === 0 ? 'pt-8 lg:pt-0' : ''
                } ${idx === 1 ? 'pt-0' : ''} ${idx > 1 ? 'pt-8 lg:pt-0' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight mb-1">
                  {item.value}
                </div>
                <div className="text-xs font-bold tracking-widest uppercase text-emerald-800 mb-1.5">
                  {item.label}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 max-w-[200px] leading-relaxed">
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
