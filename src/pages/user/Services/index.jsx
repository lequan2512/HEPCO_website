import { useState, useMemo } from 'react';
import PageBanner from '../../../components/PageBanner';
import SubNav from '../../../components/SubNav';
import { useGetNews } from '../../../apis/news';

const Services = () => {
  const [activeTab, setActiveTab] = useState(0);

  const { data: newsResponse = {}, isLoading: loading } = useGetNews({ type: 'service', limit: 10 });
  
  const services = useMemo(() => {
    const items = newsResponse.data || [];
    return [...items].sort((a, b) => a.id - b.id);
  }, [newsResponse.data]);

  const subNavItems = services.length > 0 
    ? services.map(s => s.title)
    : ['Đang tải...'];

  return (
    <div className="bg-gray-50 pb-20 min-h-screen">
      <PageBanner 
        title="Dịch vụ"
        description="Với quá trình hình thành và phát triển, bề dày gần 50 năm trong lĩnh vực vệ sinh môi trường và công trình đô thị, cùng đội ngũ cán bộ quản lý giàu kinh nghiệm, đội ngũ nhân viên người lao động lành nghề và hệ thống cơ sở vật chất phương tiện thiết bị hiện đại chúng tôi đã đang và sẽ cung cấp đến quý khách hàng các dịch vụ với chất lượng tốt nhất, uy tín nhất. Cam kết luôn đồng hành cùng quý khách hàng trong hành trình bảo vệ môi trường và phát triển bền vững."
      />

      {!loading && services.length > 0 && (
        <SubNav items={subNavItems} activeIndex={activeTab} onSelect={setActiveTab} />
      )}
      
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hepco-green"></div>
          </div>
        ) : services.length > 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-[#0066cc] text-center mb-8">
              {services[activeTab]?.title}
            </h2>
            <div 
              className="prose prose-lg max-w-none text-gray-800 mx-auto"
              dangerouslySetInnerHTML={{ __html: services[activeTab]?.content }} 
            />
          </div>
        ) : (
          <p className="text-center text-gray-500">Đang cập nhật nội dung dịch vụ...</p>
        )}
      </div>
    </div>
  );
};

export default Services;
