import { Phone, ArrowRight } from 'lucide-react';

const HomeCtaBanner = ({ config }) => {
  const scrollToContact = (e) => {
    e.preventDefault();
    const target = document.getElementById('faq-contact-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const title = config?.title || 'Chung Tay Xây Dựng Đô Thị Xanh - Sạch - Sáng';
  const subtitle = config?.subtitle || 'Liên hệ ngay với HEPCO để nhận tư vấn phương án thu gom, vệ sinh môi trường, chăm sóc cây xanh và dịch vụ công ích đô thị nhanh chóng, minh bạch.';
  const buttonText = config?.buttonText || 'Gửi Yêu Cầu Dịch Vụ';
  const hotlineDisplay = config?.hotlineDisplay || '1900.96.96.69';
  const hotlineTel = config?.hotlineTel || '1900969669';

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
              {title}
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed mb-10 font-normal">
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="#faq-contact-section"
                onClick={scrollToContact}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-[#10243b] font-bold text-base bg-white hover:bg-emerald-50 active:scale-[0.98] transition-all duration-200 shadow-lg group cursor-pointer"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4 text-[#10243b] transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href={`tel:${hotlineTel}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white font-bold text-base bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 shadow-lg"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Hotline: {hotlineDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCtaBanner;
