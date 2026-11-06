import { COMPANY } from '../constants/company';
import { useState, useEffect } from 'react';
import { Phone, Menu, X, ExternalLink } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import logo from '../assets/images/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Auto close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setIsMenuOpen(false);
  }

  // Shadow and border effect on page scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems = [
    { name: 'Trang Chủ', path: ROUTES.HOME },
    { name: 'Giới Thiệu', path: ROUTES.ABOUT },
    { name: 'Dịch Vụ', path: ROUTES.SERVICES },
    { name: 'Tin tức – Thông báo', path: ROUTES.NEWS },
    { name: 'Liên hệ', path: '/lien-he' },
    { name: 'Quan Hệ Cổ Đông', path: ROUTES.SHAREHOLDERS },
    {
      name: 'Hóa Đơn Điện Tử',
      href: COMPANY.invoiceUrl,
      isExternal: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isMenuOpen
          ? 'bg-white shadow-md border-b border-gray-200 py-2.5'
          : isScrolled
            ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-gray-200/90 py-2 sm:py-2.5'
            : 'bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200/60 py-2.5 sm:py-3.5'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 max-w-7xl">
        <div className="flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
          {/* Logo & Brand Identity */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
            title="HEPCO - Về Trang Chủ"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 rounded-xl bg-white p-1 border border-gray-200/80 shadow-xs group-hover:border-emerald-500/50 group-hover:shadow-sm transition-all duration-300 flex items-center justify-center shrink-0">
              <img
                src={logo}
                alt="HEPCO Logo"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-lg sm:text-xl xl:text-2xl font-black tracking-tight text-[#10243b] leading-none group-hover:text-emerald-700 transition-colors">
                HEPCO
              </span>
              <span className="text-[9px] sm:text-[10px] xl:text-[11px] font-bold text-emerald-700 tracking-wider uppercase leading-none mt-1">
                Môi Trường Đô Thị Huế
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (1024px+): Strictly single-line with whitespace-nowrap */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
            {navItems.map((item, index) => {
              if (item.isExternal) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-2 rounded-xl text-[12.5px] xl:text-[14px] font-bold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/70 hover:border-emerald-300 transition-all duration-200 shadow-2xs hover:shadow-xs group"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </a>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `whitespace-nowrap shrink-0 px-2.5 xl:px-3.5 py-2 rounded-xl text-[12.5px] xl:text-[14px] font-bold transition-all duration-200 ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50/90 shadow-2xs'
                        : 'text-gray-700 hover:text-[#10243b] hover:bg-gray-100/80'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action: Hotline CTA & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Tablet & Desktop Hotline Pill Button (Hidden on <1024px when drawer is open to avoid duplicate CTA) */}
            <a
              href={COMPANY.phoneHref}
              className={`${
                isMenuOpen ? 'hidden lg:inline-flex' : 'hidden sm:inline-flex'
              } whitespace-nowrap shrink-0 items-center gap-2 xl:gap-2.5 px-3.5 xl:px-4.5 py-2 rounded-full bg-[#10243b] hover:bg-emerald-700 text-white font-bold text-xs xl:text-sm shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group`}
              title="Gọi tổng đài hỗ trợ HEPCO 1900 969669"
            >
              <div className="w-6 h-6 xl:w-7 xl:h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-emerald-700 transition-all">
                <Phone className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="hidden xl:block text-[9px] font-bold uppercase tracking-wider text-emerald-400 group-hover:text-emerald-100 leading-none mb-0.5">
                  Hotline hỗ trợ
                </span>
                <span className="text-xs xl:text-sm font-black text-white tracking-wide leading-tight whitespace-nowrap">
                  1900 969669
                </span>
              </div>
            </a>

            {/* Mobile Call Button (< 640px, hidden when drawer is open) */}
            {!isMenuOpen && (
              <a
                href={COMPANY.phoneHref}
                className="sm:hidden whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#10243b] text-white font-bold text-[11px] shadow-xs"
                title="Gọi hotline 1900 969669"
              >
                <Phone className="w-3 h-3 text-emerald-400 fill-current shrink-0" />
                <span>{COMPANY.phone}</span>
              </a>
            )}

            {/* Mobile & Tablet Menu Toggle Button (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-[#10243b] hover:bg-gray-100 active:scale-95 transition-all focus:outline-hidden shrink-0"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? 'Đóng danh mục điều hướng' : 'Mở danh mục điều hướng'}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-[#10243b]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Backdrop Overlay (Positioned cleanly at top-full so no gray gap appears) */}
      {isMenuOpen && (
        <div
          className="lg:hidden absolute top-full left-0 w-full h-[100dvh] bg-black/50 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile & Tablet Navigation Drawer */}
      <div
        id="mobile-navigation"
        className={`lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-2xl transition-all duration-250 ease-out origin-top z-50 max-h-[calc(100dvh-64px)] overflow-y-auto ${
          isMenuOpen
            ? 'opacity-100 scale-y-100 visible'
            : 'opacity-0 scale-y-95 invisible pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-1.5 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item, index) => {
              if (item.isExternal) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0" />
                  </a>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50/90 border-l-4 border-emerald-600'
                        : 'text-gray-800 hover:text-[#10243b] hover:bg-gray-50'
                    }`
                  }
                >
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Mobile & Tablet Hotline Box */}
          <div className="pt-3 mt-2 border-t border-gray-200/80">
            <a
              href={COMPANY.phoneHref}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-[#10243b] hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 fill-current" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider leading-none">
                  Tổng đài hỗ trợ
                </span>
                <span className="text-base font-black text-white leading-tight mt-0.5">
                  1900 969669
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
