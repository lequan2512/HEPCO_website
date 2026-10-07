import { Calendar, FileText, AlertTriangle, ClipboardList, ArrowUpRight } from 'lucide-react';

const CoreValues = () => {
  const utilities = [
    {
      id: 'schedule',
      title: 'LỊCH GOM RÁC',
      subtitle: 'Tra cứu thời gian và tuyến thu gom theo từng Phường, xã',
      buttonText: 'Tra cứu tuyến đường',
      icon: Calendar,
      href: 'https://www.hepco.com.vn/Tintuc/Lich-trinh-thu-gom-rac-tren-ia-ban-Nam-song-Huong_20263',
      badge: 'Cập nhật 2026',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'invoice',
      title: 'HÓA ĐƠN ĐIỆN TỬ',
      subtitle: 'Tra cứu, xuất hóa đơn & thanh toán tiền dịch vụ vệ sinh trực tuyến',
      buttonText: 'Thanh toán online',
      icon: FileText,
      href: 'https://hoadondientu.hepco.com.vn/',
      badge: 'Cổng thanh toán',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: 'report',
      title: 'BÁO CÁO SỰ CỐ',
      subtitle: 'Gửi hình ảnh và tọa độ điểm rác thải phát sinh về trung tâm',
      buttonText: 'Gửi phản ánh 24/7',
      icon: AlertTriangle,
      href: 'https://www.facebook.com/hepco.com.vn',
      badge: 'Phản ứng nhanh',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'register',
      title: 'ĐĂNG KÝ DỊCH VỤ',
      subtitle: 'Đăng ký hút hầm cầu, cắt tỉa cành cây, dọn vệ sinh công trình',
      buttonText: 'Đăng ký ngay',
      icon: ClipboardList,
      href: 'https://www.facebook.com/hepco.com.vn',
      badge: 'Dịch vụ trọn gói',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-[#fafafa] border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#10243b] tracking-tight">
              Tra Cứu &amp; Dịch Vụ Nhanh
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
              Hệ thống công cụ trực tuyến phục vụ người dân, hộ kinh doanh và doanh nghiệp giải quyết thủ tục nhanh chóng, minh bạch.
            </p>
          </div>
        </div>

        {/* Utilities Cards Grid (Oakdale Style Minimalist Framing) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {utilities.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-gray-200 hover:border-emerald-600/50 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 text-gray-700 group-hover:text-emerald-700 flex items-center justify-center transition-colors border border-gray-100 group-hover:border-emerald-200">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#10243b] group-hover:text-emerald-700 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6 font-normal">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold text-[#10243b] group-hover:text-emerald-700 transition-colors">
                  <span>{item.buttonText}</span>
                  <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
