import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import logo from '../assets/images/logo.png';

const Footer = () => {
  return (
    <footer className="bg-hepco-green text-white relative overflow-hidden pt-16 pb-8">
      {/* Background shape/line art */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full h-auto" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="0.5">
           <path d="M0,20 L10,10 L20,20 L30,5 L40,20 L50,15 L60,20 L70,10 L80,20 L90,15 L100,20" />
           <circle cx="15" cy="5" r="2" />
           <circle cx="35" cy="15" r="1" />
           <circle cx="75" cy="8" r="3" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Column 1: Logo & Intro */}
          <div className="col-span-1 mb-10 md:mb-0">
            <div className="flex items-center gap-4 mb-6">
              <img src={logo} alt="HEPCO" className="h-16 w-auto rounded-full bg-white p-1" />
              <span className="text-2xl font-bold tracking-wide">HEPCO</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 opacity-90 text-justify">
              Phát huy thế mạnh và đa dạng hóa lĩnh vực hoạt động để trở thành Công ty môi trường hàng đầu khu vực miền Trung - Tây Nguyên
            </p>
            <Link to={ROUTES.ABOUT} className="inline-block bg-hepco-orange hover:bg-orange-600 text-white font-bold py-2 px-8 rounded transition-colors shadow-md">
              GIỚI THIỆU
            </Link>
          </div>

          {/* Column 2: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative inline-block">
              Cổng thông tin điện tử:
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-hepco-orange"></div>
            </h3>
            <div className="space-y-4 text-sm opacity-90">
              <p className="font-bold uppercase leading-snug">
                CÔNG TY CỔ PHẦN MÔI TRƯỜNG VÀ CÔNG TRÌNH ĐÔ THỊ HUẾ
              </p>
              <div className="flex gap-3 mt-4">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <p>46 Trần Phú, Phường Thuận Hóa, Thành phố Huế</p>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <p>Hotline: (0234) 3823896<br/>Đường dây nóng: (0234) 3997799</p>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <p>info@hepco.com.vn</p>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-hepco-orange transition-colors">
                <span className="text-xs font-bold">Zalo</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-hepco-orange transition-colors">
                {/* Fallback to SVG since lucide removed Facebook */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-hepco-orange transition-colors">
                {/* Fallback to SVG since lucide removed Youtube */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 3: Gallery */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative inline-block">
              Thư viện ảnh:
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-hepco-orange"></div>
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/20 rounded overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                   <div className="w-full h-full bg-gray-400"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-16 pt-6 border-t border-white/20 text-center text-xs opacity-70">
          © {new Date().getFullYear()} HEPCO. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
