import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Mail, MapPin, Phone } from 'lucide-react';
import { ROUTES } from '../../../../constants/routes';
import { COMPANY } from '../../../../constants/company';

const HomeContact = () => (
  <>
    <section className="py-12 sm:py-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <p className="text-sm font-medium text-emerald-800 mb-2">Về HEPCO</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">Gắn bó với nhịp sống đô thị Huế</h2>
          <p className="text-gray-600 leading-relaxed mb-5">{COMPANY.name}. Tìm hiểu về tổ chức, lĩnh vực hoạt động và những hoạt động thực tế của HEPCO.</p>
          <Link to={ROUTES.ABOUT} className="inline-flex items-center gap-2 min-h-11 font-medium text-emerald-800 hover:underline">Tìm hiểu về HEPCO <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-6 sm:p-8">
          <FileText className="w-7 h-7 text-emerald-800 mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Thông tin dành cho cổ đông</h2>
          <p className="text-gray-600 leading-relaxed mb-4">Công bố thông tin, báo cáo và tài liệu đại hội cổ đông. Tìm kiếm thuận tiện theo năm và nhóm tài liệu.</p>
          <Link to={ROUTES.SHAREHOLDERS} className="inline-flex items-center gap-2 min-h-11 font-medium text-emerald-800 hover:underline">Tra cứu tài liệu <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
    <section id="lien-he" className="py-10 sm:py-12 bg-emerald-950 text-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div><h2 className="text-2xl font-semibold mb-2">HEPCO sẵn sàng lắng nghe</h2><p className="text-emerald-100 leading-relaxed">Liên hệ để được hướng dẫn về dịch vụ hoặc phản ánh về vệ sinh môi trường.</p></div>
          <a href={COMPANY.phoneHref} className="inline-flex items-center justify-center gap-2 shrink-0 rounded-lg px-5 min-h-12 bg-white text-emerald-950 font-semibold hover:bg-emerald-50"><Phone className="w-4 h-4" aria-hidden="true" />Gọi {COMPANY.phone}</a>
        </div>
        <address className="not-italic grid md:grid-cols-2 gap-5 border-t border-white/20 pt-6 text-sm text-emerald-50">
          <p className="flex gap-3 leading-relaxed"><MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />{COMPANY.address}</p>
          <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-3 hover:underline break-all"><Mail className="w-5 h-5 shrink-0" aria-hidden="true" />{COMPANY.email}</a>
        </address>
      </div>
    </section>
  </>
);
export default HomeContact;
