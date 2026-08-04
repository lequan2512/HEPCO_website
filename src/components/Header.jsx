import { useState } from 'react';
import { Phone, Menu, X } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import logo from '../assets/images/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'TRANG CHỦ', path: ROUTES.HOME },
    { name: 'GIỚI THIỆU', path: ROUTES.ABOUT },
    { name: 'DỊCH VỤ', path: ROUTES.SERVICES },
    { name: 'TIN TỨC', path: ROUTES.NEWS },
    { name: 'QUAN HỆ CỔ ĐÔNG', path: ROUTES.SHAREHOLDERS },
    { name: 'HÓA ĐƠN ĐIỆN TỬ', href: 'https://hoadondientu.hepco.com.vn/', isExternal: true },
  ];

  return (
    <header className="bg-hepco-green text-white sticky top-0 w-full z-50 shadow-xl">
      <div className="flex items-center justify-between h-20 pl-4 md:pl-8">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex-shrink-0 z-50">
          <img src={logo} alt="HEPCO" className="h-12 w-auto md:h-16 rounded-full bg-white p-1" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-6 text-sm font-semibold tracking-wide flex-grow justify-center">
          {navItems.map((item, index) => (
            item.isExternal ? (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-300 transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `hover:text-yellow-300 transition-colors ${isActive ? 'text-yellow-400' : ''}`
                }
              >
                {item.name}
              </NavLink>
            )
          ))}
        </nav>

        {/* Desktop Hotline Section & Mobile Toggle */}
        <div className="h-full flex items-center justify-end flex-1 lg:flex-none">
          {/* Hotline Desktop */}
          <div className="hidden sm:flex h-full bg-white text-gray-800 items-center pr-3 md:pr-5 pl-5 md:pl-8 clip-diagonal" style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)' }}>
            <div className="flex items-center space-x-1.5 md:space-x-2 text-hepco-orange">
              <Phone className="w-4 h-4 md:w-4.5 md:h-4.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-bold leading-none tracking-wide text-gray-500 uppercase">Hotline</span>
                <a href="tel:1900969669" className="text-xs md:text-xs font-extrabold leading-tight text-hepco-orange hover:underline whitespace-nowrap">1900 969669</a>
              </div>
            </div>
          </div>

          {/* Mobile Quick Call Button & Menu Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 mr-3 lg:mr-0 z-50">
            <a
              href="tel:1900969669"
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-yellow-300 hover:bg-white/30 transition-colors shadow-xs"
              title="Gọi hotline 1900 969669"
            >
              <Phone className="w-4.5 h-4.5" />
            </a>

            <button
              className="lg:hidden p-2 text-white hover:text-yellow-300 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-20 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <div
        className={`lg:hidden absolute top-20 left-0 w-full bg-hepco-green shadow-xl transition-all duration-300 ease-in-out origin-top z-50 ${isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
          }`}
      >
        <nav className="flex flex-col px-6 py-4 space-y-4 font-semibold tracking-wide">
          {navItems.map((item, index) => (
            item.isExternal ? (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="block pb-2 border-b border-white/10 hover:text-yellow-300 transition-colors"
              >
                {item.name}
              </a>
            ) : (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block pb-2 border-b border-white/10 hover:text-yellow-300 transition-colors ${isActive ? 'text-yellow-400 border-yellow-400/30' : ''
                  }`
                }
              >
                {item.name}
              </NavLink>
            )
          ))}
          {/* Mobile Hotline */}
          <div className="flex items-center space-x-3 pt-2 text-yellow-400">
            <Phone className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight text-white">Hotline</span>
              <a href="tel:1900969669" className="text-sm font-bold leading-tight hover:underline">1900 969669</a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
