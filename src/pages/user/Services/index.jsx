import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import SubNav from '../../../components/SubNav';
import Loading from '../../../components/Loading';
import { useGetNews } from '../../../apis/news';
import { resolveAssetUrl, sanitizeLegacyHtml } from '../../../utils/assetUrl';

const Services = () => {
  const location = useLocation();

  const { data: newsResponse = {}, isLoading: loading } = useGetNews({ type: 'service', limit: 10 });

  const services = useMemo(() => {
    return newsResponse.data || [];
  }, [newsResponse.data]);

  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const [prevLocationKey, setPrevLocationKey] = useState(location.key);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key);
    setUserSelectedTab(null);
    setLightboxIndex(null);
  }

  let activeTab = 0;
  if (userSelectedTab !== null) {
    activeTab = userSelectedTab;
  } else if (location.state?.serviceId && services.length > 0) {
    const idx = services.findIndex((s) => s.id === location.state.serviceId);
    activeTab = idx !== -1 ? idx : 0;
  } else if (location.state?.tab !== undefined) {
    activeTab = location.state.tab;
  }

  const currentService = services[activeTab] || null;
  const serviceImages = useMemo(() => {
    if (!currentService) return [];
    if (Array.isArray(currentService.images) && currentService.images.length > 0) {
      return currentService.images.map((img) =>
        typeof img === 'string'
          ? { url: resolveAssetUrl(img), caption: currentService.title }
          : { url: resolveAssetUrl(img.url), caption: img.caption || currentService.title }
      );
    }
    if (currentService.thumbnail && currentService.thumbnail !== '/images/cover.png') {
      return [{ url: resolveAssetUrl(currentService.thumbnail), caption: currentService.title }];
    }
    return [];
  }, [currentService]);

  const subNavItems =
    services.length > 0 ? services.map((s) => s.title) : ['Đang tải...'];

  const handleSelectTab = (idx) => {
    setUserSelectedTab(idx);
    setLightboxIndex(null);
  };

  return (
    <div className="bg-gray-50 pb-20 min-h-screen">
      <PageBanner
        title="Dịch vụ"
        description="Với quá trình hình thành và phát triển, bề dày gần 50 năm trong lĩnh vực vệ sinh môi trường và công trình đô thị, cùng đội ngũ cán bộ quản lý giàu kinh nghiệm, đội ngũ nhân viên người lao động lành nghề và hệ thống cơ sở vật chất phương tiện thiết bị hiện đại chúng tôi đã đang và sẽ cung cấp đến quý khách hàng các dịch vụ với chất lượng tốt nhất, uy tín nhất. Cam kết luôn đồng hành cùng quý khách hàng trong hành trình bảo vệ môi trường và phát triển bền vững."
      />

      {!loading && services.length > 0 && (
        <SubNav items={subNavItems} activeIndex={activeTab} onSelect={handleSelectTab} />
      )}

      <div className="container mx-auto px-2.5 sm:px-4 mt-6 sm:mt-8 md:mt-12 max-w-6xl">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 md:p-12 min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <Loading message="Đang tải thông tin dịch vụ..." />
          ) : currentService ? (
            <div className="w-full overflow-hidden">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-green-900 uppercase relative inline-block pb-3">
                  {currentService.title}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-hepco-orange rounded-full" />
                </h2>
              </div>

              {serviceImages.length > 0 && (
                <div className="mb-8 sm:mb-10">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Hình ảnh hoạt động thực tế ({serviceImages.length})</span>
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      Nhấn vào ảnh để xem kích thước lớn
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {serviceImages.map((img, idx) => (
                      <button
                        key={img.url + idx}
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-4/3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs hover:shadow-lg transition-all"
                      >
                        <img
                          src={img.url}
                          alt={img.caption}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                        <p className="absolute bottom-2.5 left-3 right-3 text-xs text-white font-medium line-clamp-2 leading-snug">
                          {img.caption}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full overflow-x-auto no-scrollbar">
                <div
                  className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-gray-700 leading-relaxed mx-auto break-words prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto prose-img:my-6 prose-headings:text-green-900 prose-headings:font-bold"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeLegacyHtml(currentService.content)
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Đang cập nhật nội dung dịch vụ...</p>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Service Operational Photos */}
      {lightboxIndex !== null && serviceImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {serviceImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
                }}
                className="absolute left-3 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % serviceImages.length);
                }}
                className="absolute right-3 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={serviceImages[lightboxIndex].url}
              alt={serviceImages[lightboxIndex].caption}
              className="max-h-[78vh] w-auto rounded-2xl shadow-2xl object-contain"
            />
            <p className="mt-4 text-center text-white/95 text-sm sm:text-base font-medium max-w-2xl px-4">
              {serviceImages[lightboxIndex].caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
