import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetBanners } from '../apis/banner';
import { API_BASE_URL } from '../constants/api';

const Hero = () => {
  const { data: banners = [] } = useGetBanners();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) {
    // Fallback if no banners are uploaded yet
    return (
      <div className="relative w-full h-[500px] md:h-[700px] bg-[#3f9e4d] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-green-700/60 to-[#3f9e4d]/90 mix-blend-multiply z-0"></div>
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-300 rounded-full blur-[80px]"></div>
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-yellow-400 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-20 flex flex-col items-center text-center mt-[-180px] w-full px-4">
          <h1 className="text-white text-4xl md:text-7xl font-extrabold tracking-wide mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            CÁM ƠN QUÝ KHÁCH HÀNG
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center mt-2 relative">
            <span className="text-[#f26522] font-[cursive] text-5xl md:text-[5.5rem] md:-rotate-12 md:-mr-4 drop-shadow-md z-10 md:translate-y-4">
              Đã đồng hành
            </span>
            <span 
              className="text-[#f26522] font-black text-5xl md:text-[7rem] tracking-tight uppercase"
              style={{ 
                 WebkitTextStroke: '3px white', 
                 textShadow: '0 8px 0px rgba(0,0,0,0.2), 0 15px 10px rgba(0,0,0,0.3)' 
              }}
            >
              CÙNG HEPCO
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[700px] flex items-center justify-center overflow-hidden group">
      {/* Slider Images */}
      {banners.map((url, index) => (
        <div 
          key={index} 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img 
            src={`${API_BASE_URL}${url}`} 
            alt={`Banner ${index}`} 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Slider Controls (Visible on hover if multiple banners) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 md:left-8 z-30 w-12 h-12 bg-black/40 rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 md:right-8 z-30 w-12 h-12 bg-black/40 rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;

