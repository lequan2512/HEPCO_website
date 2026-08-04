import { ArrowRight } from 'lucide-react';

const CoreValues = () => {
  const utilities = [
    {
      id: 'schedule',
      title: 'LỊCH GOM RÁC',
      subtitle: 'Tra cứu lịch thu gom theo Phường / Tuyến đường',
      buttonText: 'Tra cứu ngay',
      emoji: '🗓️',
      href: 'https://www.hepco.com.vn/Tintuc/Lich-trinh-thu-gom-rac-tren-ia-ban-Nam-song-Huong_20263',
      accentGradient: 'bg-gradient-to-r from-emerald-500 to-green-400',
      badgeBg: 'bg-emerald-50 group-hover:bg-emerald-100/80 border border-emerald-100',
      titleColor: 'text-[#15803d]',
      buttonBg: 'bg-emerald-100/80 text-emerald-900 group-hover:bg-[#15803d] group-hover:text-white'
    },
    {
      id: 'invoice',
      title: 'HÓA ĐƠN ĐIỆN TỬ',
      subtitle: 'Tra cứu & Thanh toán tiền dịch vụ trực tuyến',
      buttonText: 'Thanh toán ngay',
      emoji: '📄',
      href: 'https://hoadondientu.hepco.com.vn/',
      accentGradient: 'bg-gradient-to-r from-sky-500 to-blue-500',
      badgeBg: 'bg-sky-50 group-hover:bg-sky-100/80 border border-sky-100',
      titleColor: 'text-[#0369a1]',
      buttonBg: 'bg-sky-100/80 text-sky-900 group-hover:bg-[#0369a1] group-hover:text-white'
    },
    {
      id: 'report',
      title: 'BÁO CÁO SỰ CỐ',
      subtitle: 'Gửi ảnh & vị trí rác thải tồn đọng về HEPCO',
      buttonText: 'Gửi phản ánh',
      emoji: '🚨',
      href: 'https://www.facebook.com/hepco.com.vn',
      accentGradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-50 group-hover:bg-amber-100/80 border border-amber-100',
      titleColor: 'text-[#c2410c]',
      buttonBg: 'bg-amber-100/80 text-amber-900 group-hover:bg-[#c2410c] group-hover:text-white'
    },
    {
      id: 'register',
      title: 'ĐĂNG KÝ DỊCH VỤ',
      subtitle: 'Đăng ký hút hầm cầu, cắt tỉa cây xanh, vệ sinh',
      buttonText: 'Đăng ký ngay',
      emoji: '📝',
      href: 'https://www.facebook.com/hepco.com.vn',
      accentGradient: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      badgeBg: 'bg-purple-50 group-hover:bg-purple-100/80 border border-purple-100',
      titleColor: 'text-[#7e22ce]',
      buttonBg: 'bg-purple-100/80 text-purple-900 group-hover:bg-[#7e22ce] group-hover:text-white'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 border-y border-gray-100/80 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-8xl relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-start mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-green-900 tracking-tight uppercase">
            TIỆN ÍCH & TRA CỨU NHANH
          </h2>
          <div className="w-16 h-1 bg-hepco-orange rounded-full mt-2.5"></div>
        </div>

        {/* Utilities Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {utilities.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group hover:-translate-y-1.5 relative overflow-hidden block cursor-pointer"
            >
              {/* Top Colored Accent Bar on Hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${item.accentGradient}`}
              />

              <div>
                {/* Emoji Badge & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors shadow-2xs ${item.badgeBg}`}
                  >
                    <span>{item.emoji}</span>
                  </div>
                  <h3 className={`font-black text-sm md:text-base tracking-wide transition-colors ${item.titleColor}`}>
                    {item.title}
                  </h3>
                </div>

                {/* Subtitle */}
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-6 font-medium">
                  {item.subtitle}
                </p>
              </div>

              {/* Action Button Link */}
              <div
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 transition-all duration-300 shadow-2xs group-hover:shadow-md ${item.buttonBg}`}
              >
                <span>{item.buttonText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
