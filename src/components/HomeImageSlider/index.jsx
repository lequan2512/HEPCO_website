import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetBanners } from '../../apis/banner';
import { API_BASE_URL } from '../../constants/api';

const HomeImageSlider = () => {
  const { data: bannersRes, isLoading } = useGetBanners({ limit: 1000 });
  const banners = bannersRes?.data || [];
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

  if (isLoading || banners.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4 uppercase">Hình Ảnh Hoạt Động</h2>
          <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
        </div>

        <div className="relative w-full h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden group rounded-2xl shadow-xl">
          {/* Slider Images */}
          {banners.map((url, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img 
                src={url.startsWith('http') ? url : `${API_BASE_URL}${url}`} 
                alt={`Slide ${index}`} 
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
      </div>
    </section>
  );
};

export default HomeImageSlider;
