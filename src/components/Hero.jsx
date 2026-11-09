import { useState } from 'react';
import { ArrowRight, Phone, Play, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { getHeroSettings } from '../services/news.service';
import { resolveAssetUrl } from '../utils/assetUrl';
import bgImg from '../assets/images/bg-img.avif';

const Hero = ({ config }) => {
  const [showVideo, setShowVideo] = useState(false);
  const heroSettings = getHeroSettings();
  const heroConfig = {
    ...heroSettings,
    ...(config || {})
  };

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat pt-6 pb-10 sm:pt-10 sm:pb-14 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24 border-b border-gray-200/70"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.20) 10%, rgba(255, 255, 255, 0.45) 55%, rgba(255, 255, 255, 0.96) 100%), url(${bgImg})`
      }}
    >
      <div className="container mx-auto px-3.5 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Display Headline */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#10243b] leading-[1.2] sm:leading-[1.15] mb-4 sm:mb-6 drop-shadow-2xs">
            <span className="block">{heroConfig.headlinePrefix}</span>
            <span className="block text-hepco-green mt-1 sm:mt-2">
              {heroConfig.headlineHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 max-w-3xl leading-relaxed mb-6 sm:mb-8 md:mb-10 font-medium px-1">
            {heroConfig.subtitle}
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none">
            <Link
              to={heroConfig.primaryCtaLink || ROUTES.SERVICES}
              className="w-full sm:w-auto whitespace-nowrap inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-white font-bold text-sm sm:text-base bg-[#10243b] hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-xl group"
            >
              <span>{heroConfig.primaryCtaText || 'Khám Phá Dịch Vụ'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
            </Link>

            <a
              href={`tel:${heroConfig.hotlineTel || '1900969669'}`}
              className="w-full sm:w-auto whitespace-nowrap inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl text-gray-800 font-bold text-sm sm:text-base bg-white hover:bg-gray-50 border border-gray-300 shadow-xs hover:border-gray-400 transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hotline: {heroConfig.hotlineDisplay || '1900.96.96.69'}</span>
            </a>
          </div>
        </div>

        {/* Hero Showcase Frame - Adaptive aspect ratio so banner graphics are never cropped */}
        <div className="relative mt-2 sm:mt-4 md:mt-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/90 shadow-2xl bg-[#0e3b2f]">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] overflow-hidden group flex items-center justify-center">
              <img
                src={resolveAssetUrl(heroConfig.coverImage || '/uploads/images/TongQuan_6a06c09d.jpg')}
                alt="HEPCO - Vì Môi Trường Huế Xanh Sạch Sáng"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/uploads/images/TongQuan_6a06c09d.jpg';
                }}
                className="w-full h-full object-contain sm:object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e2e]/55 via-transparent to-transparent pointer-events-none" />

              {/* Video Play Button Overlay */}
              <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-6 z-10">
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className="flex items-center gap-2 sm:gap-3 px-3.5 py-2 sm:px-5 sm:py-3 rounded-full bg-white/95 hover:bg-white text-[#10243b] font-bold text-xs sm:text-sm shadow-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 border border-white/80 group/btn cursor-pointer"
                  title="Xem video giới thiệu HEPCO"
                >
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover/btn:bg-emerald-700 transition-colors shrink-0">
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 fill-current" />
                  </div>
                  <span className="pr-1 whitespace-nowrap">
                    {heroConfig.videoButtonText || 'Xem Phim Giới Thiệu'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowVideo(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-black/60 hover:bg-rose-600 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={heroConfig.videoUrl || 'https://www.youtube.com/embed/P7RZLoytEBI?autoplay=1'}
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
