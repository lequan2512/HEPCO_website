import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PageBanner from '../../../components/PageBanner';
import SubNav from '../../../components/SubNav';
import Loading from '../../../components/Loading';
import { useGetNews } from '../../../apis/news';
import { sanitizeLegacyHtml } from '../../../utils/assetUrl';

const Services = () => {
  const location = useLocation();

  const { data: newsResponse = {}, isLoading: loading } = useGetNews({ type: 'service', limit: 10 });

  const services = useMemo(() => {
    return newsResponse.data || [];
  }, [newsResponse.data]);

  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const [prevLocationKey, setPrevLocationKey] = useState(location.key);

  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key);
    setUserSelectedTab(null);
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

  const subNavItems =
    services.length > 0 ? services.map((s) => s.title) : ['Đang tải...'];

  return (
    <div className="bg-gray-50 pb-20 min-h-screen">
      <PageBanner
        title="Dịch vụ"
        description="Với quá trình hình thành và phát triển, bề dày gần 50 năm trong lĩnh vực vệ sinh môi trường và công trình đô thị, cùng đội ngũ cán bộ quản lý giàu kinh nghiệm, đội ngũ nhân viên người lao động lành nghề và hệ thống cơ sở vật chất phương tiện thiết bị hiện đại chúng tôi đã đang và sẽ cung cấp đến quý khách hàng các dịch vụ với chất lượng tốt nhất, uy tín nhất. Cam kết luôn đồng hành cùng quý khách hàng trong hành trình bảo vệ môi trường và phát triển bền vững."
      />

      {!loading && services.length > 0 && (
        <SubNav items={subNavItems} activeIndex={activeTab} onSelect={setUserSelectedTab} />
      )}

      <div className="container mx-auto px-2.5 sm:px-4 mt-6 sm:mt-8 md:mt-12 max-w-6xl">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 md:p-12 min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <Loading message="Đang tải thông tin dịch vụ..." />
          ) : services.length > 0 ? (
            <div className="w-full overflow-hidden">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-green-900 uppercase relative inline-block pb-3">
                  {services[activeTab]?.title}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-hepco-orange rounded-full" />
                </h2>
              </div>

              <div className="w-full overflow-x-auto no-scrollbar">
                <div
                  className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-gray-700 leading-relaxed mx-auto break-words prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto prose-img:my-6 prose-headings:text-green-900 prose-headings:font-bold"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeLegacyHtml(services[activeTab]?.content)
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Đang cập nhật nội dung dịch vụ...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
