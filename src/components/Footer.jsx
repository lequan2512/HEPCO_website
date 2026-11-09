import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import logo from '../assets/images/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-green-900 to-hepco-green text-white relative overflow-hidden pt-10 pb-6">
      {/* Background shape/line art */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg
          className="absolute bottom-0 left-0 w-full h-auto"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <path d="M0,20 L10,10 L20,20 L30,5 L40,20 L50,15 L60,20 L70,10 L80,20 L90,15 L100,20" />
          <circle cx="15" cy="5" r="2" />
          <circle cx="35" cy="15" r="1" />
          <circle cx="75" cy="8" r="3" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-8xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Column 1: Logo & Intro */}
          <div className="col-span-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="HEPCO"
                className="h-12 w-auto rounded-full bg-white p-1 shadow-md"
              />
              <span className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">
                HEPCO
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-green-50 text-justify">
              Phát huy thế mạnh và đa dạng hóa lĩnh vực hoạt động để trở thành Công ty môi trường hàng đầu khu vực miền Trung - Tây Nguyên.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/hepco.com.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-hepco-orange transition-all hover:scale-110 shadow-md border border-white/5"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a
                href="mailto:info@hepco.com.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-hepco-orange transition-all hover:scale-110 shadow-md border border-white/5"
                title="Gửi Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-5 relative inline-block text-white">
              Cổng thông tin điện tử
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-hepco-orange rounded-full"></div>
            </h3>
            <div className="space-y-4 text-sm text-green-50">
              <p className="font-extrabold uppercase leading-snug text-white">
                CÔNG TY CỔ PHẦN MÔI TRƯỜNG VÀ CÔNG TRÌNH ĐÔ THỊ HUẾ
              </p>
              <div className="flex gap-3 items-start group">
                <div className="bg-white/10 p-1.5 rounded-md group-hover:bg-hepco-orange transition-colors">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <p>46 Trần Phú, Phường Thuận Hóa, Thành phố Huế</p>
              </div>
              <div className="flex gap-3 items-start group">
                <div className="bg-white/10 p-1.5 rounded-md group-hover:bg-hepco-orange transition-colors">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <p>
                  Hotline / Đường dây nóng:{' '}
                  <a href="tel:1900969669" className="font-bold text-white hover:underline">
                    1900 969669
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-white/20 text-center text-xs text-green-100 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} HEPCO. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="opacity-70">Thiết kế &amp; Phát triển bởi HEPCO IT</p>
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/25 text-white font-semibold transition-colors"
              title="Truy cập Hệ thống Quản trị Website"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản trị</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
