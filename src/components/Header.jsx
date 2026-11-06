import { useEffect, useRef, useState } from 'react';
import { Phone, Menu, X, ExternalLink } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { COMPANY } from '../constants/company';
import logo from '../assets/images/logo.png';

const navItems = [
  { name: 'Trang chủ', path: ROUTES.HOME },
  { name: 'Giới thiệu', path: ROUTES.ABOUT },
  { name: 'Dịch vụ', path: ROUTES.SERVICES },
  { name: 'Tin tức – Thông báo', path: ROUTES.NEWS },
  { name: 'Quan hệ cổ đông', path: ROUTES.SHAREHOLDERS },
  { name: 'Liên hệ', path: '/lien-he' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef(null);
  const [previousPath, setPreviousPath] = useState(location.pathname);
  if (location.pathname !== previousPath) {
    setPreviousPath(location.pathname);
    setIsMenuOpen(false);
  }
  useEffect(() => {
    if (!isMenuOpen) return;
    const onEscape = (event) => {
      if (event.key === 'Escape') { setIsMenuOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:px-4 focus:py-3 focus:bg-white focus:text-emerald-900">Đến nội dung chính</a>
      <div className="bg-emerald-950 text-emerald-50 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3 py-2">
          <span className="hidden sm:block">Vì môi trường đô thị Huế xanh – sạch – đẹp</span>
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-5 gap-y-1 w-full sm:w-auto">
            <a href={COMPANY.phoneHref} className="inline-flex items-center gap-2 hover:underline"><Phone className="w-3.5 h-3.5" aria-hidden="true" />{COMPANY.phone}</a>
            <a href={COMPANY.invoiceUrl} target="_blank" rel="noopener noreferrer" aria-label="Hóa đơn điện tử (mở trong thẻ mới)" className="inline-flex items-center gap-2 hover:underline">Hóa đơn điện tử <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 py-3">
        <Link to={ROUTES.HOME} aria-label="HEPCO – Trang chủ" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="" width="48" height="48" className="w-12 h-12 object-contain" />
          <span><span className="block font-bold text-2xl leading-none text-emerald-900">HEPCO</span><span className="block text-xs text-gray-600 mt-1.5">Môi trường đô thị Huế</span></span>
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => <NavLink key={item.path} to={item.path} end={item.path === ROUTES.HOME} className={({ isActive }) => `px-3 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-800'}`}>{item.name}</NavLink>)}
        </nav>
        <button ref={menuButton} type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'} aria-controls="mobile-navigation" aria-expanded={isMenuOpen} className="xl:hidden inline-flex items-center justify-center min-w-12 min-h-12 rounded-lg border border-gray-200 text-emerald-900">
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {isMenuOpen && <nav id="mobile-navigation" aria-label="Điều hướng trên điện thoại" className="xl:hidden border-t border-gray-100 max-h-[65dvh] overflow-y-auto px-4 py-3 bg-white">
        {navItems.map((item) => <NavLink key={item.path} to={item.path} end={item.path === ROUTES.HOME} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `block rounded-lg px-4 py-3 text-base font-medium ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-50'}`}>{item.name}</NavLink>)}
      </nav>}
    </header>
  );
};
export default Header;
