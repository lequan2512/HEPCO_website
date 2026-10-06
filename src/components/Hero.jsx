import { useState } from 'react';
import { ArrowRight, Phone, Play, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import bgImg from '../assets/images/bg-img.avif';

const Hero = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat pt-10 pb-16 md:pt-16 md:pb-24 border-b border-gray-200/70"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.20) 10%, rgba(255, 255, 255, 0.45) 55%, rgba(255, 255, 255, 0.96) 100%), url(${bgImg})`,
      }}
    >

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Display Headline */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-10 md:mb-14">

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#10243b] leading-[1.15] mb-6 drop-shadow-2xs">
            Hạ Tầng Đô Thị &amp; Môi Trường Xanh{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700">
              Cho Cố Đô Vững Bền
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-800 max-w-3xl leading-relaxed mb-8 sm:mb-10 font-medium">
            Gần 50 năm đồng hành cùng tỉnh Thừa Thiên Huế, HEPCO cung ứng trọn gói dịch vụ thu gom chất thải, vệ sinh môi trường, chăm sóc cây xanh công viên và chiếu sáng công cộng đạt chuẩn chất lượng cao.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to={ROUTES.SERVICES}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white font-bold text-base bg-[#10243b] hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-xl group"
            >
              <span>Khám Phá Dịch Vụ</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="tel:02343822052"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-gray-800 font-bold text-base bg-white hover:bg-gray-50 border border-gray-300 shadow-xs hover:border-gray-400 transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Hotline: (0234) 3822 052</span>
            </a>
          </div>
        </div>

        {/* Hero Showcase Grid (Oakdale Style Feature Presentation) */}
        <div className="relative mt-4 md:mt-8">
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/90 shadow-2xl bg-white">
            {/* Main Visual Image */}
            <div className="relative h-[220px] sm:h-[340px] lg:h-[420px] w-full overflow-hidden group">
              <img
                src="/images/cover.png"
                alt="HEPCO - Vì Môi Trường Huế Xanh Sạch Sáng"
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#10243b]/80 via-[#10243b]/20 to-transparent pointer-events-none" />
              {/* Video Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-white/90 hover:bg-white text-[#10243b] font-bold text-sm shadow-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 border border-white/80 group/btn"
                  title="Xem video giới thiệu HEPCO"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover/btn:bg-emerald-700 transition-colors">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </div>
                  <span className="pr-1">Xem Phim Giới Thiệu</span>
                </button>
              </div>

              {/* Bottom Feature Card - Oakdale Tents Floating Spotlight */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-10">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/P7RZLoytEBI?autoplay=1"
                title="Giới thiệu HEPCO"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
