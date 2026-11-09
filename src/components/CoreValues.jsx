import { Calendar, FileText, AlertTriangle, ClipboardList, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_UTILITIES = [
  {
    id: 'schedule',
    title: 'LỊCH GOM RÁC',
    subtitle: 'Tra cứu thời gian và tuyến thu gom theo từng Phường, xã',
    buttonText: 'Tra cứu tuyến đường',
    icon: Calendar,
    link: '/tin-tuc',
    badge: 'Cập nhật 2026',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'invoice',
    title: 'HÓA ĐƠN ĐIỆN TỬ',
    subtitle: 'Tra cứu, xuất hóa đơn & thanh toán tiền dịch vụ vệ sinh trực tuyến',
    buttonText: 'Thanh toán online',
    icon: FileText,
    link: 'https://hoadondientu.hepco.com.vn/',
    badge: 'Cổng thanh toán',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'report',
    title: 'BÁO CÁO SỰ CỐ',
    subtitle: 'Gửi hình ảnh và tọa độ điểm rác thải phát sinh về trung tâm',
    buttonText: 'Gửi phản ánh 24/7',
    icon: AlertTriangle,
    link: 'https://www.facebook.com/hepco.com.vn',
    badge: 'Phản ứng nhanh',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'register',
    title: 'ĐĂNG KÝ DỊCH VỤ',
    subtitle: 'Đăng ký hút hầm cầu, cắt tỉa cành cây, dọn vệ sinh công trình',
    buttonText: 'Đăng ký ngay',
    icon: ClipboardList,
    link: 'https://www.facebook.com/hepco.com.vn',
    badge: 'Dịch vụ trọn gói',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
];

const ICONS = [Calendar, FileText, AlertTriangle, ClipboardList];
const COLORS = [
  'bg-emerald-50 text-emerald-800 border-emerald-200',
  'bg-blue-50 text-blue-800 border-blue-200',
  'bg-amber-50 text-amber-800 border-amber-200',
  'bg-purple-50 text-purple-800 border-purple-200'
];

const CoreValues = ({ config }) => {
  const utilities = Array.isArray(config) && config.length > 0
    ? config.map((item, idx) => ({
        ...item,
        icon: ICONS[idx % ICONS.length],
        badgeColor: COLORS[idx % COLORS.length],
        link: item.link || item.href || item.internalPath || '/tin-tuc'
      }))
    : DEFAULT_UTILITIES;

  return (
    <section className="py-16 md:py-20 bg-[#fafafa] border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#10243b] tracking-tight">
              Tra Cứu &amp; Dịch Vụ Nhanh
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 font-normal">
              Cổng tiện ích trực tuyến phục vụ người dân, hộ gia đình và cơ quan, doanh nghiệp tại TP. Huế.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {utilities.map((item, idx) => {
            const IconComponent = item.icon || Calendar;
            const targetUrl = item.link || item.href || '/tin-tuc';
            const isExternal = targetUrl.startsWith('http');

            const cardInner = (
              <>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 text-gray-700 group-hover:text-emerald-700 flex items-center justify-center transition-colors border border-gray-100 group-hover:border-emerald-200">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#10243b] group-hover:text-emerald-700 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#10243b] group-hover:text-emerald-700">
                  <span>{item.buttonText}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </>
            );

            const cardClass =
              'group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-gray-200 hover:border-emerald-600/50 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5';

            if (!isExternal) {
              return (
                <Link key={item.id || idx} to={targetUrl} className={cardClass}>
                  {cardInner}
                </Link>
              );
            }

            return (
              <a
                key={item.id || idx}
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                {cardInner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
