import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../constants/routes';
import { COMPANY } from '../../../../constants/company';

const HomeContact = () => (
  <>
    <section className="py-12 md:py-16 bg-emerald-50 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-emerald-900 mb-4">Đồng hành cùng môi trường đô thị Huế</h2>
          <p className="text-gray-700 leading-relaxed mb-5">{COMPANY.name}. Tìm hiểu về tổ chức, lĩnh vực hoạt động và những hoạt động thực tế của HEPCO.</p>
          <Link to={ROUTES.ABOUT} className="font-semibold text-emerald-800 underline underline-offset-4">Giới thiệu HEPCO</Link>
        </div>
        <div className="bg-white border border-emerald-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-3">Thông tin dành cho cổ đông</h2>
          <p className="text-gray-700 leading-relaxed mb-5">Tra cứu công bố thông tin, báo cáo và tài liệu đại hội cổ đông theo năm và nhóm tài liệu.</p>
          <Link to={ROUTES.SHAREHOLDERS} className="font-semibold text-emerald-800 underline underline-offset-4">Tra cứu tài liệu cổ đông</Link>
        </div>
      </div>
    </section>
    <section id="lien-he" className="py-12 md:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-emerald-900 mb-4">Liên hệ HEPCO</h2>
        <p className="text-gray-700 mb-6">Liên hệ để được hướng dẫn về dịch vụ hoặc phản ánh về vệ sinh môi trường.</p>
        <address className="not-italic flex flex-col md:flex-row gap-4 md:gap-8 text-gray-800">
          <span>{COMPANY.address}</span>
          <a href={COMPANY.phoneHref} className="font-semibold text-emerald-800 underline">{COMPANY.phone}</a>
          <a href={`mailto:${COMPANY.email}`} className="text-emerald-800 underline">{COMPANY.email}</a>
        </address>
      </div>
    </section>
  </>
);
export default HomeContact;
