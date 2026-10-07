import { useState, useEffect } from 'react';
import { Phone, Menu, X, ExternalLink } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import logo from '../assets/images/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Tự động đóng menu mobile khi đổi trang
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Hiệu ứng đổ bóng và viền khi cuộn trang
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

  const navItems = [
    { name: 'Trang Chủ', path: ROUTES.HOME },
    { name: 'Giới Thiệu', path: ROUTES.ABOUT },
    { name: 'Dịch Vụ', path: ROUTES.SERVICES },
    { name: 'Tin Tức', path: ROUTES.NEWS },
    { name: 'Quan Hệ Cổ Đông', path: ROUTES.SHAREHOLDERS },
    {
      name: 'Hóa Đơn Điện Tử',
      href: 'https://hoadondientu.hepco.com.vn/',
      isExternal: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-gray-200/90 py-2.5'
          : 'bg-white/92 backdrop-blur-md shadow-xs border-b border-gray-200/60 py-3.5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-3 sm:gap-3.5 group flex-shrink-0"
            title="HEPCO - Về Trang Chủ"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1 border border-gray-200/80 shadow-xs group-hover:border-emerald-500/50 group-hover:shadow-sm transition-all duration-300 flex items-center justify-center">
              <img
                src={logo}
                alt="HEPCO Logo"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#10243b] leading-none group-hover:text-emerald-700 transition-colors">
                HEPCO
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 tracking-wider uppercase leading-none mt-1">
                Môi Trường Đô Thị Huế
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item, index) => {
              if (item.isExternal) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] xl:text-[14px] font-bold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/70 hover:border-emerald-300 transition-all duration-200 shadow-2xs hover:shadow-xs group"
                  >
                    <span>{item.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </a>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-[13px] xl:text-[14px] font-bold transition-all duration-200 ${
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
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Desktop Hotline Pill Button */}
            <a
              href="tel:1900969669"
              className="hidden sm:inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-[#10243b] hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
              title="Gọi tổng đài hỗ trợ HEPCO 1900 969669"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-white group-hover:text-emerald-700 transition-all">
                <Phone className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 group-hover:text-emerald-100 leading-none">
                  Hotline 24/7
                </span>
                <span className="text-xs sm:text-sm font-black text-white tracking-wide leading-tight">
                  1900 969669
                </span>
              </div>
            </a>

            {/* Mobile Call Icon */}
            <a
              href="tel:1900969669"
              className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#10243b] text-white font-bold text-xs shadow-xs"
              title="Gọi hotline 1900 969669"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 fill-current" />
              <span>1900 969669</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-[#10243b] hover:bg-gray-100 active:scale-95 transition-all focus:outline-hidden"
              aria-label="Mở danh mục điều hướng"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-[#10243b]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[65px] bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-2xl transition-all duration-300 ease-in-out origin-top z-50 ${
          isMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-1 max-w-7xl">
          {navItems.map((item, index) => {
            if (item.isExternal) {
              return (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 my-1"
                >
                  <span>{item.name}</span>
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
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

          {/* Mobile Hotline Box */}
          <div className="pt-3 mt-2 border-t border-gray-200/80">
            <a
              href="tel:1900969669"
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-[#10243b] text-white font-bold text-sm shadow-md"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-4 h-4 fill-current" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider leading-none">
                  Tổng Đài Trực 24/7
                </span>
                <span className="text-base font-black text-white leading-tight">1900 969669</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

