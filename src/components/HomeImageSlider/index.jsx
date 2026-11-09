import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetBanners } from '../../apis/banner';
import { useGetGallery } from '../../apis/news';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { ROUTES } from '../../constants/routes';

const HomeImageSlider = () => {
  // Tự động lấy các hình ảnh hoạt động mới nhất đã tải lên từ Database (Gallery & Banner)
  const { data: galleryRes, isLoading: isGalleryLoading } = useGetGallery({ limit: 16 });
  const { data: bannersRes, isLoading: isBannersLoading } = useGetBanners({ limit: 16 });

  const galleryItems = galleryRes?.data || [];
  const bannerList = bannersRes?.data || [];

  // Tự động gộp và ưu tiên hình ảnh hoạt động mới nhất, loại bỏ trùng lặp
  const seenUrls = new Set();
  const slides = [];

  for (const item of galleryItems) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      slides.push({
        url: item.url,
        caption: item.caption || item.title || 'Hoạt động HEPCO',
        category: item.categoryLabel || 'Hoạt động công ty',
        date: item.date || '2026'
      });
    }
  }

  for (const url of bannerList) {
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      slides.push({
        url,
        caption: 'Hoạt động thực tế HEPCO',
        category: 'Công tác đô thị',
        date: '2026'
      });
    }
  }

  // Dự phòng ảnh chuẩn HEPCO nếu chưa có ảnh nào
  if (slides.length === 0) {
    slides.push({
      url: '/uploads/images/TongQuan_6a06c09d.jpg',
      caption: 'Công ty Cổ phần Môi trường và Công trình Đô thị Huế',
      category: 'Hoạt động công ty',
      date: '2026'
    });
  }

  const banners = slides.map((s) => s.url);
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
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
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

  if ((isGalleryLoading && isBannersLoading) || banners.length === 0) {
    return null;
  }

  const currentSlideInfo = slides[currentSlide];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div className="max-w-4xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight text-balance">
              Hình Ảnh Hoạt Động
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Những khoảnh khắc ghi lại các hoạt động nổi bật, phong trào thi đua và công tác thực tế của HEPCO.
            </p>
          </div>
          <Link
            to={`${ROUTES.NEWS}?tab=gallery`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-sm transition-colors border border-emerald-200 self-start sm:self-auto shrink-0"
          >
            <ImageIcon className="w-4 h-4" />
            Xem tất cả hình ảnh ({galleryRes?.meta?.total || slides.length})
          </Link>
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
                {/* Ambient blur background */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
                <img
                  src={imageUrl}
                  alt={slides[index]?.caption || `Slide ${index + 1}`}
                  className="relative z-10 w-full h-full object-cover object-center select-none pointer-events-none"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/uploads/images/HL-2_a07c11d6.jpg"; }}
                />
                {/* Paper curl shadow effect during page flip */}
                {isAnimating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 pointer-events-none"></div>
                )}
              </div>
            );
          })}

          {/* Caption Overlay */}
          {currentSlideInfo?.caption && (
            <div className="absolute bottom-5 sm:bottom-6 left-5 right-5 sm:left-8 sm:right-auto sm:max-w-xl z-25 bg-black/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-white pointer-events-none shadow-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                  {currentSlideInfo.category}
                </span>
                {currentSlideInfo.date && (
                  <span className="text-xs text-gray-300 font-medium">
                    {currentSlideInfo.date}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold line-clamp-2 leading-snug">
                {currentSlideInfo.caption}
              </h3>
            </div>
          )}

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
              <div className="absolute bottom-4 sm:bottom-6 right-6 sm:right-8 z-30 flex gap-1.5 sm:gap-2">
                {banners.slice(0, 10).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => changeSlide(index, index > currentSlide ? 'next' : 'prev')}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer ${
                      index === currentSlide ? 'bg-emerald-400 scale-125 shadow-md' : 'bg-white/50 hover:bg-white/80'
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
