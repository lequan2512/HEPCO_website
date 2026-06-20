import { Phone } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const Header = () => {
  const navItems = [
    { name: 'TRANG CHỦ', path: ROUTES.HOME },
    { name: 'GIỚI THIỆU', path: ROUTES.ABOUT },
    { name: 'DỊCH VỤ', path: ROUTES.SERVICES },
    { name: 'TIN TỨC', path: ROUTES.NEWS },
    { name: 'CỔ ĐÔNG', path: ROUTES.SHAREHOLDERS },
  ];

  return (
    <header className="bg-hepco-green text-white flex items-center justify-between h-20 pl-8">
      {/* Logo */}
      <Link to={ROUTES.HOME} className="flex-shrink-0">
        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center font-bold text-xl relative">
          <span className="z-10">HEPCO</span>
          {/* A simple placeholder for the logo inner details */}
          <div className="absolute bottom-2 w-10 h-1 bg-white rounded"></div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="hidden lg:flex space-x-6 text-sm font-semibold tracking-wide flex-grow justify-center">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `hover:text-yellow-300 transition-colors ${isActive ? 'text-yellow-400' : ''}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Hotline Section */}
      <div className="h-full bg-white text-gray-800 flex items-center pr-8 pl-12 clip-diagonal" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}>
        <div className="flex items-center space-x-3 mr-6 text-hepco-orange">
          <Phone className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">Hotline</span>
            <span className="text-sm font-bold leading-tight">(0234) 3997799</span>
          </div>
        </div>
        {/* Vietnam Flag Placeholder */}
        <div className="w-8 h-5 bg-red-600 relative flex items-center justify-center">
          <div className="text-yellow-400 text-xs">★</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
