import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetBanners } from '../../apis/banner';
import { resolveAssetUrl } from '../../utils/assetUrl';

const HomeImageSlider = () => {
  const { data: bannersRes, isLoading } = useGetBanners({ limit: 1000 });
  const banners = bannersRes?.data || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatingSlide, setAnimatingSlide] = useState(null);
  const [direction, setDirection] = useState('next');

  // Touch & Mouse drag tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  // Reset animation state after 850ms
  useEffect(() => {
    if (animatingSlide === null) return;
    const timer = setTimeout(() => {
      setAnimatingSlide(null);
    }, 850);
    return () => clearTimeout(timer);
  }, [animatingSlide]);

  const changeSlide = (newIndex, dir) => {
    if (newIndex === currentSlide || animatingSlide !== null) return;
    setAnimatingSlide(currentSlide);
    setDirection(dir);
    setCurrentSlide(newIndex);
  };

  const nextSlide = () => {
    if (banners.length <= 1) return;
    const nextIdx = (currentSlide + 1) % banners.length;
    changeSlide(nextIdx, 'next');
  };

  const prevSlide = () => {
    if (banners.length <= 1) return;
    const prevIdx = (currentSlide - 1 + banners.length) % banners.length;
    changeSlide(prevIdx, 'prev');
  };

  // Drag & Swipe event handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    touchEndX.current = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      nextSlide(); // Dragged left -> switch to next image
    } else if (distance < -minSwipeDistance) {
      prevSlide(); // Dragged right -> switch to previous image
    }
  };

  // Autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextIdx = (prev + 1) % banners.length;
        setAnimatingSlide(prev);
        setDirection('next');
        return nextIdx;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (isLoading || banners.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-2xl mb-12 md:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight">
            Hình Ảnh Hoạt Động
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Những khoảnh khắc ghi lại các hoạt động nổi bật và phong trào tiêu biểu của HEPCO.
          </p>
        </div>

        <div
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden group rounded-3xl shadow-2xl border border-gray-200/90 perspective-1500 bg-gray-900 cursor-grab active:cursor-grabbing select-none"
        >
          {/* Slider Images with 3D Page Flip */}
          {banners.map((url, index) => {
            const isCurrent = index === currentSlide;
            const isAnimating = index === animatingSlide;
            if (!isCurrent && !isAnimating) return null;

            const imageUrl = resolveAssetUrl(url);

            return (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full ${
                  isAnimating
                    ? direction === 'next'
                      ? 'animate-page-flip-next z-20'
                      : 'animate-page-flip-prev z-20'
                    : 'z-10'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`Slide ${index}`}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                {/* Paper curl shadow effect during page flip */}
                {isAnimating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 pointer-events-none"></div>
                )}
              </div>
            );
          })}

          {/* Slider Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 md:left-6 z-30 w-10 h-10 md:w-12 md:h-12 bg-black/40 rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-all opacity-80 md:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-3 md:right-6 z-30 w-10 h-10 md:w-12 md:h-12 bg-black/40 rounded-full text-white flex items-center justify-center hover:bg-black/70 transition-all opacity-80 md:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => changeSlide(index, index > currentSlide ? 'next' : 'prev')}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer ${
                      index === currentSlide ? 'bg-white scale-125 shadow-md' : 'bg-white/50 hover:bg-white/80'
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
