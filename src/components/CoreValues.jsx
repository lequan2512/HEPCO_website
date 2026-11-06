import { CalendarDays, FileText, MessageSquare, Phone, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANY } from '../constants/company';

const utilities = [
  { title: 'Lịch thu gom rác', description: 'Xem lịch trình và tuyến thu gom tại khu vực của bạn.', action: 'Xem lịch thu gom', icon: CalendarDays, path: COMPANY.collectionSchedule },
  { title: 'Hóa đơn điện tử', description: 'Truy cập cổng tra cứu hóa đơn dịch vụ của HEPCO.', action: 'Tra cứu hóa đơn', icon: FileText, href: COMPANY.invoiceUrl },
  { title: 'Phản ánh môi trường', description: 'Trao đổi, gửi phản ánh qua trang Facebook HEPCO.', action: 'Mở Facebook HEPCO', icon: MessageSquare, href: COMPANY.facebook },
  { title: 'Tư vấn dịch vụ', description: 'Tìm thông tin liên hệ để được hướng dẫn sử dụng dịch vụ.', action: 'Thông tin liên hệ', icon: Phone, path: '/lien-he' },
];

const CoreValues = () => (
  <section id="tien-ich" className="py-10 sm:py-12 bg-white border-b border-gray-200 scroll-mt-28" aria-labelledby="utilities-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap justify-between items-baseline gap-2 mb-6">
        <h2 id="utilities-heading" className="text-2xl font-semibold text-gray-900">Bạn cần hỗ trợ gì?</h2>
        <p className="text-sm text-gray-600">Thông tin thiết yếu dành cho người dân và khách hàng</p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {utilities.map((item) => {
          const Icon = item.icon;
          const content = <>
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-emerald-50 text-emerald-800 mb-4"><Icon className="w-5 h-5" aria-hidden="true" /></span>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-800">{item.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600 mt-2 mb-5 flex-1">{item.description}</p>
            <span className="inline-flex items-center justify-between gap-2 text-sm font-medium text-emerald-800">{item.action}{item.href ? <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" /> : <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />}</span>
          </>;
          const className = 'group flex flex-col p-5 rounded-xl border border-gray-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 transition-colors';
          return item.path ? <Link key={item.title} to={item.path} className={className}>{content}</Link> : <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title} (mở trong thẻ mới)`} className={className}>{content}</a>;
        })}
      </div>
    </div>
  </section>
);
export default CoreValues;
