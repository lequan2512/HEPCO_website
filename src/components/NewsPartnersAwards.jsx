import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useGetNews } from '../apis/news';
import { resolveAssetUrl } from '../utils/assetUrl';

const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  const cleaned = html
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ');
  const tmp = document.createElement('DIV');
  tmp.innerHTML = cleaned;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const PARTNERS = [
  { img: '/images/partner/benh-vien.jpg', alt: 'Bệnh viện Răng Hàm Mặt Huế', round: true, url: 'https://bvrhm.hue.gov.vn/' },
  { img: '/images/partner/logomgreen.png', alt: 'mGreen', round: false, url: 'https://mgreen.vn' },
  { img: '/images/partner/scavi.jpg', alt: 'Scavi Group', round: true, url: 'http://scavi.com.vn' },
  { img: '/images/partner/toyota.png', alt: 'Toyota Việt Nam', round: false, url: 'https://www.toyota.com.vn' },
  { img: '/images/partner/usaid.jpg', alt: 'USAID', round: true, url: 'https://www.usaid.gov' },
  { img: '/images/partner/wwf.webp', alt: 'WWF Việt Nam', round: false, url: 'https://vietnam.wwf.org' },
];

const AWARDS = [
  { img: '/images/merit/bang-khen1.jpg', alt: 'Bằng khen 1' },
  { img: '/images/merit/bang-khen2.jpg', alt: 'Bằng khen 2' },
  { img: '/images/merit/bang-khen3.jpg', alt: 'Bằng khen 3' },
  { img: '/images/merit/bang-khen4.jpg', alt: 'Bằng khen 4' },
  { img: '/images/merit/bang-khen5.jpg', alt: 'Bằng khen 5' },
];

const getNewsSortScore = (item) => {
  const dStr = item.date || item.created_at || '';
  let score = 0;
  if (typeof dStr === 'string' && dStr.includes('2026')) {
    score += 10000000000000;
  }
  return score + parseNewsDate(dStr);
};

const parseNewsDate = (dStr) => {
  if (!dStr) return 0;
  if (typeof dStr === 'string') {
    const cleanStr = dStr.trim();
    const datePart = cleanStr.split(' ')[0];
    const parts = datePart.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(cleanStr).getTime() || 0;
      }
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      const timePart = cleanStr.split(' ')[1] || '00:00:00';
      return new Date(`${year}-${month}-${day}T${timePart}`).getTime() || 0;
    }
  }
  return new Date(dStr).getTime() || 0;
};

const NewsPartnersAwards = () => {
  const navigate = useNavigate();
  const { data: newsResponse } = useGetNews({ type: 'news', limit: 8 });

  const rawNews = Array.isArray(newsResponse?.data) ? newsResponse.data : [];
  const news = [...rawNews].sort((a, b) => {
    const timeA = getNewsSortScore(a);
    const timeB = getNewsSortScore(b);
    return timeB - timeA;
  }).slice(0, 4);

  const partnerScrollRef = useRef(null);
  const awardScrollRef = useRef(null);

  const [isDraggingPartner, setIsDraggingPartner] = useState(false);
  const [startXPartner, setStartXPartner] = useState(0);
  const [scrollLeftPartner, setScrollLeftPartner] = useState(0);
  const [isHoveredPartner, setIsHoveredPartner] = useState(false);
  const [hasDraggedPartner, setHasDraggedPartner] = useState(false);

  const [isDraggingAward, setIsDraggingAward] = useState(false);
  const [startXAward, setStartXAward] = useState(0);
  const [scrollLeftAward, setScrollLeftAward] = useState(0);
  const [isHoveredAward, setIsHoveredAward] = useState(false);

  useEffect(() => {
    const el = partnerScrollRef.current;
    if (!el) return;
    let animId;
    const step = () => {
      if (!isDraggingPartner && !isHoveredPartner && el) {
        el.scrollLeft += 0.8;
        const thirdWidth = el.scrollWidth / 3;
        if (thirdWidth > 0 && el.scrollLeft >= thirdWidth) {
          el.scrollLeft -= thirdWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isDraggingPartner, isHoveredPartner]);

  useEffect(() => {
    const el = awardScrollRef.current;
    if (!el) return;
    let animId;
    const step = () => {
      if (!isDraggingAward && !isHoveredAward && el) {
        el.scrollLeft += 0.6;
        const thirdWidth = el.scrollWidth / 3;
        if (thirdWidth > 0 && el.scrollLeft >= thirdWidth) {
          el.scrollLeft -= thirdWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isDraggingAward, isHoveredAward]);

  const handleMouseDownPartner = (e) => {
    if (!partnerScrollRef.current) return;
    setIsDraggingPartner(true);
    setHasDraggedPartner(false);
    setStartXPartner(e.pageX - partnerScrollRef.current.offsetLeft);
    setScrollLeftPartner(partnerScrollRef.current.scrollLeft);
  };

  const handleMouseMovePartner = (e) => {
    if (!isDraggingPartner || !partnerScrollRef.current) return;
    const x = e.pageX - partnerScrollRef.current.offsetLeft;
    const walk = (x - startXPartner) * 1.8;
    if (Math.abs(walk) > 5) setHasDraggedPartner(true);
    e.preventDefault();
    partnerScrollRef.current.scrollLeft = scrollLeftPartner - walk;
  };

  const handleMouseDownAward = (e) => {
    if (!awardScrollRef.current) return;
    setIsDraggingAward(true);
    setStartXAward(e.pageX - awardScrollRef.current.offsetLeft);
    setScrollLeftAward(awardScrollRef.current.scrollLeft);
  };

  const handleMouseMoveAward = (e) => {
    if (!isDraggingAward || !awardScrollRef.current) return;
    const x = e.pageX - awardScrollRef.current.offsetLeft;
    const walk = (x - startXAward) * 1.8;
    e.preventDefault();
    awardScrollRef.current.scrollLeft = scrollLeftAward - walk;
  };

  const handlePartnerClick = (url) => {
    if (hasDraggedPartner) return;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="py-20 md:py-28 relative bg-white overflow-hidden border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* News Section */}
        {news.length > 0 && (
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
              <div className="max-w-4xl">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight text-balance">
                  Tin Tức &amp; Sự Kiện Mới Nhất
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
                  Cập nhật các hoạt động sản xuất kinh doanh, phong trào thi đua và thông báo chính thức từ HEPCO.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(ROUTES.NEWS)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-[#10243b] text-[#10243b] hover:text-white font-bold text-sm transition-all duration-300 shadow-2xs group self-start md:self-auto cursor-pointer"
              >
                <span>Xem Tất Cả Tin Tức</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {news.map((item, i) => {
                const displayDate = item.date || formatDate(item.created_at);
                const categoryLabel = item.categoryLabel || item.category || (item.type === 'shareholders' ? 'Quan hệ cổ đông' : item.type === 'service' ? 'Dịch vụ' : 'Tin tức');
                return (
                  <div
                    key={i}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-200/90 hover:border-emerald-600/60 shadow-xs hover:shadow-xl flex flex-col group cursor-pointer transition-all duration-500 hover:-translate-y-2"
                    onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', item.id))}
                  >
                    <div className="h-52 bg-gray-100 relative overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={resolveAssetUrl(item.thumbnail)}
                          alt={item.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/cover.png';
                          }}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center font-black text-emerald-800 text-lg">
                          HEPCO News
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                      <span className="absolute top-3.5 right-3.5 backdrop-blur-md font-bold text-[11px] px-3 py-1 rounded-full shadow-xs z-10 bg-white/90 text-[#10243b]">
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        {displayDate && (
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-2.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{displayDate}</span>
                          </div>
                        )}

                        <h3 className="text-base sm:text-lg font-bold text-[#10243b] group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2 leading-snug text-balance">
                          {item.title}
                        </h3>

                        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed font-normal">
                          {item.summary || (typeof item.content === 'string' ? stripHtml(item.content) : 'Click vào để xem chi tiết bài viết...')}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#10243b] group-hover:text-emerald-700">
                        <span>Đọc tiếp</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Partners Section */}
        <div className="mb-20 pt-10 border-t border-gray-100">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#10243b] tracking-tight">
              Đồng Hành &amp; Phát Triển
            </h2>
          </div>

          <div
            ref={partnerScrollRef}
            onMouseDown={handleMouseDownPartner}
            onMouseLeave={() => { setIsDraggingPartner(false); setIsHoveredPartner(false); }}
            onMouseUp={() => setIsDraggingPartner(false)}
            onMouseMove={handleMouseMovePartner}
            onMouseEnter={() => setIsHoveredPartner(true)}
            className="flex items-center gap-6 sm:gap-10 overflow-x-auto py-4 px-2 no-scrollbar select-none cursor-grab active:cursor-grabbing"
          >
            {Array.from({ length: 6 }, () => PARTNERS).flat().map((item, idx) => (
              <div
                key={idx}
                onClick={() => handlePartnerClick(item.url)}
                title={`Ghé thăm website ${item.alt}`}
                className={`${item.round ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full' : 'w-36 sm:w-44 h-20 rounded-2xl'} bg-white flex items-center justify-center shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-200/90 overflow-hidden shrink-0 cursor-pointer group/item p-4`}
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover/item:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Awards Section */}
        <div className="pt-10 border-t border-gray-100">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#10243b] tracking-tight">
              Thành Tích &amp; Khen Thưởng
            </h2>
          </div>

          <div
            ref={awardScrollRef}
            onMouseDown={handleMouseDownAward}
            onMouseLeave={() => { setIsDraggingAward(false); setIsHoveredAward(false); }}
            onMouseUp={() => setIsDraggingAward(false)}
            onMouseMove={handleMouseMoveAward}
            onMouseEnter={() => setIsHoveredAward(true)}
            className="flex items-center gap-6 overflow-x-auto py-4 px-2 no-scrollbar select-none cursor-grab active:cursor-grabbing"
          >
            {Array.from({ length: 8 }, () => AWARDS).flat().map((item, idx) => (
              <div
                key={idx}
                className="w-72 sm:w-80 h-52 sm:h-60 bg-white border border-gray-200 rounded-3xl shadow-xs hover:shadow-xl hover:-translate-y-1 shrink-0 flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer p-3"
              >
                <img
                  src={item.img}
                  alt={item.alt}
                  className="w-full h-full object-cover rounded-2xl pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsPartnersAwards;
