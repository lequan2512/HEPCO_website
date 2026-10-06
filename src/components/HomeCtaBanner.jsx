import { Phone, ArrowRight, Mail, MapPin } from 'lucide-react';

const HomeCtaBanner = () => {
  const scrollToContact = (e) => {
    e.preventDefault();
    const target = document.getElementById('faq-contact-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative rounded-3xl bg-[#10243b] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Display Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6">
              Chung Tay Xây Dựng Đô Thị{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Xanh - Sạch - Sáng
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed mb-10 font-normal">
              Liên hệ ngay với HEPCO để nhận tư vấn phương án thu gom, vệ sinh môi trường, chăm sóc cây xanh và dịch vụ công ích đô thị nhanh chóng, minh bạch.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="#faq-contact-section"
                onClick={scrollToContact}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-[#10243b] font-bold text-base bg-white hover:bg-emerald-50 active:scale-[0.98] transition-all duration-200 shadow-lg group"
              >
                <span>Gửi Yêu Cầu Dịch Vụ</span>
                <ArrowRight className="w-4 h-4 text-[#10243b] transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="tel:02343822052"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white font-bold text-base bg-white/10 hover:bg-white/20 border border-white/20 active:scale-[0.98] transition-all backdrop-blur-md"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Gọi Hotline: (0234) 3822 052</span>
              </a>
            </div>

            {/* Quick Contact Info Strip */}
            <div className="mt-12 pt-8 border-t border-white/10 w-full flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>46 Trần Phú, TP. Huế</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@hepco.com.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Tổng đài hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCtaBanner;
