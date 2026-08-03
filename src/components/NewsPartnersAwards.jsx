import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useGetNews } from '../apis/news';
import { API_BASE_URL } from '../constants/api';

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
  const { data: newsResponse = {} } = useGetNews({
    type: 'news,shareholders',
    limit: 8,
    sort: 'date_desc',
    sortBy: 'date',
    order: 'desc'
  });

  const rawNews = newsResponse.data || [];
  const news = [...rawNews].sort((a, b) => {
    const timeA = parseNewsDate(a.date || a.published_at || a.created_at);
    const timeB = parseNewsDate(b.date || b.published_at || b.created_at);
    return timeB - timeA;
  });

  const partnerScrollRef = useRef(null);
  const awardScrollRef = useRef(null);

  const [isDraggingPartner, setIsDraggingPartner] = useState(false);
  const [isHoveredPartner, setIsHoveredPartner] = useState(false);
  const [startXPartner, setStartXPartner] = useState(0);
  const [scrollLeftPartner, setScrollLeftPartner] = useState(0);
  const [hasDraggedPartner, setHasDraggedPartner] = useState(false);

  const [isDraggingAward, setIsDraggingAward] = useState(false);
  const [isHoveredAward, setIsHoveredAward] = useState(false);
  const [startXAward, setStartXAward] = useState(0);
  const [scrollLeftAward, setScrollLeftAward] = useState(0);

  // Auto-scroll Partner loop
  useEffect(() => {
    const el = partnerScrollRef.current;
    if (!el) return;
    let animId;
    const step = () => {
      if (!isDraggingPartner && !isHoveredPartner && el) {
        el.scrollLeft += 0.8;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isDraggingPartner, isHoveredPartner]);

  // Auto-scroll Award loop
  useEffect(() => {
    const el = awardScrollRef.current;
    if (!el) return;
    let animId;
    const step = () => {
      if (!isDraggingAward && !isHoveredAward && el) {
        el.scrollLeft += 0.6;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
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
    if (!hasDraggedPartner && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="py-20 relative bg-white overflow-hidden">
      {/* Background shape */}
      <div className="absolute inset-0 z-0">
        <svg className="absolute w-full h-[150%] top-[-20%] right-[-30%] opacity-10 text-hepco-green" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-8xl relative z-10">
        {/* News Section */}
        {news.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-16 relative">
              <h2 className="text-4xl font-extrabold text-green-900 inline-block relative pb-4">
                TIN TỨC NỔI BẬT
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {news.map((item, i) => {
                const displayDate = item.date || formatDate(item.created_at);
                const categoryLabel = item.category || (item.type === 'shareholders' ? 'Quan hệ cổ đông' : item.type === 'service' ? 'Dịch vụ' : 'Tin tức');
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 flex flex-col group cursor-pointer transition-all duration-500 hover:-translate-y-2"
                    onClick={() => navigate(ROUTES.ARTICLE_DETAIL.replace(':id', item.id))}
                  >
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail?.startsWith('http') ? item.thumbnail : `${API_BASE_URL}${item.thumbnail}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center font-bold text-hepco-green">
                          HEPCO News
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/5 group-hover:scale-105 transition-transform duration-500"></div>
                      {/* Category Badge on Home Page */}
                      <span className={`absolute top-3 right-3 backdrop-blur-sm font-bold text-xs px-3 py-1 rounded-full shadow-md z-10 border border-white/20 ${item.type === 'shareholders'
                        ? 'bg-hepco-orange text-white'
                        : 'bg-white/95 text-hepco-green'
                        }`}>
                        {categoryLabel}
                      </span>
                    </div>
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                          {displayDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-hepco-green" />
                              <span>{displayDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-hepco-green font-extrabold text-base mb-2 line-clamp-2 leading-snug group-hover:text-hepco-orange transition-colors">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                          {typeof item.content === 'string' ? stripHtml(item.content) : 'Click vào để xem chi tiết bài viết...'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Partners Section */}
        <div className="mb-20 relative">
          <div className="text-center mb-10 relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-green-900 inline-block relative pb-4 uppercase">
              Đối tác & Khách hàng
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
            </h2>
          </div>

          <div
            ref={partnerScrollRef}
            onMouseDown={handleMouseDownPartner}
            onMouseLeave={() => { setIsDraggingPartner(false); setIsHoveredPartner(false); }}
            onMouseUp={() => setIsDraggingPartner(false)}
            onMouseMove={handleMouseMovePartner}
            onMouseEnter={() => setIsHoveredPartner(true)}
            className="flex items-center gap-8 sm:gap-12 overflow-x-auto py-4 px-2 no-scrollbar select-none cursor-grab active:cursor-grabbing"
          >
            {[...PARTNERS, ...PARTNERS].map((item, idx) => (
              <div
                key={idx}
                onClick={() => handlePartnerClick(item.url)}
                title={`Ghé thăm website ${item.alt}`}
                className={`${item.round ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full' : 'w-32 sm:w-40 h-16 sm:h-20 rounded-xl'} bg-white flex items-center justify-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 overflow-hidden shrink-0 cursor-pointer group/item`}
              >
                <img src={item.img} alt={item.alt} className="w-full h-full object-contain p-2 pointer-events-none transition-transform duration-300 group-hover/item:scale-105" />
              </div>
            ))}
          </div>
        </div>

        {/* Awards Section */}
        <div className="relative">
          <div className="text-center mb-10 relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-green-900 inline-block relative pb-4 uppercase">
              Thành tích & Khen thưởng
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
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
              {[...AWARDS, ...AWARDS].map((item, idx) => (
                <div
                  key={idx}
                  className="w-72 sm:w-80 h-52 sm:h-60 bg-white border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-1 shrink-0 flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <img src={item.img} alt={item.alt} className="w-full h-full object-cover p-2 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
};

export default NewsPartnersAwards;
