import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Award, Leaf, Building2, Users, CheckCircle2 } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import SubNav from '../../../components/SubNav';

const About = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const subNavItems = ['Về Hepco', 'Chức năng - Giấy phép', 'Sơ đồ tổ chức', 'Thành tựu đạt được', 'Hồ sơ năng lực', 'Thư viện ảnh'];

  useEffect(() => {
    if (location.state && typeof location.state.tab === 'number') {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  return (
    <div className="bg-gray-50 pb-20 min-h-screen">
      <PageBanner 
        title="Giới thiệu"
        description="Tiền thân là phòng quản lý đô thị và nhà đất được ra đời năm 1975, trải qua quá trình hình thành và phát triển với nhiều cột mốc thay đổi, năm 2015 Công ty trách nhiệm hữu hạn nhà nước Môi trường và Công trình Đô thị Huế trở thành Công ty Cổ phần Môi trường và Công trình đô thị Huế cho đến nay. Là doanh nghiệp nhà nước chi phối 51% cổ phần với bộ máy tổ chức gồm 05 phòng nghiệp vụ và 13 đơn vị xí nghiệp trực thuộc. Hepco là đơn vị uy tín hàng đầu miền Trung hoạt động trong lĩnh vực vệ sinh môi trường và công trình đô thị với gần 500 khách hàng, đối tác trên địa bàn toàn tỉnh Thừa Thiên Huế."
      />
      <SubNav items={subNavItems} activeIndex={activeTab} onSelect={setActiveTab} />
      
      <div className="container mx-auto px-4 mt-16 max-w-8xl">
        
        {activeTab === 0 && (
          <div className="space-y-24">
            {/* Open Letter Section */}
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* Left Image */}
              <div className="w-full lg:w-5/12 relative group">
                <div className="absolute inset-0 bg-hepco-green rounded-2xl transform translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl h-[400px] border-4 border-white flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-[url('/images/cover.png')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="text-center p-6 bg-white/90 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-500">
                        <Building2 className="w-12 h-12 text-hepco-green mx-auto mb-2" />
                        <h3 className="text-2xl font-extrabold text-green-900">Trụ sở HEPCO</h3>
                        <p className="text-sm font-semibold text-gray-500 mt-1">46 Trần Phú, TP. Huế</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="w-full lg:w-7/12 bg-white p-8 md:p-12 rounded-3xl shadow-xl relative border border-gray-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0 opacity-50"></div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-extrabold text-green-900 mb-8 inline-block relative pb-4 uppercase">
                    Thư ngỏ
                    <div className="absolute bottom-0 left-0 w-24 h-1 bg-hepco-orange rounded-full"></div>
                  </h2>
                  
                  <div className="prose prose-lg text-gray-700 space-y-6 text-justify">
                    <p className="italic font-bold text-hepco-green text-xl">Kính gửi Quý khách hàng,</p>
                    <p className="leading-relaxed">
                      Chúng tôi trân trọng gửi lời chào và sự biết ơn sâu sắc đến Quý khách hàng đã tin tưởng và ủng hộ <strong className="text-green-800">Công ty Cổ Phần Môi trường và Công trình đô thị Huế (HEPCO)</strong> trong suốt thời gian qua. Với bề dày gần <span className="bg-yellow-100 px-1 font-bold text-orange-600 rounded">50 năm kinh nghiệm</span>, cùng với đội ngũ nhân sự luôn tận tụy và hệ thống phương tiện thiết bị tiên tiến, chúng tôi khẳng định hoàn toàn đáp ứng mọi yêu cầu của Quý khách hàng trong lĩnh vực vệ sinh môi trường và công trình đô thị.
                    </p>
                    <p className="leading-relaxed">
                      Trên suốt chặng đường hình thành và phát triển, HEPCO không chỉ là một đối tác được chính quyền đô thị địa phương tín nhiệm giao nhiệm vụ, đặt hàng và thực hiện đấu thầu mà còn là đối tác đáng tin cậy của các tổ chức, doanh nghiệp và cá nhân trong lĩnh vực thu gom, vận chuyển, và xử lý chất thải trên địa bàn tỉnh Thừa Thiên Huế. 
                    </p>
                    <div className="bg-green-50 p-6 rounded-xl border-l-4 border-hepco-green my-6 shadow-sm">
                      <p className="font-semibold text-green-900 mb-0">
                        Ngoài thực hiện các công tác ở lĩnh vực vệ sinh môi trường, chúng tôi còn thực hiện thi công hệ thống điện chiếu sáng đô thị và trang trí đường phố, cũng như các công trình thoát nước, xây dựng hạ tầng, dân dụng và các lĩnh vực kinh doanh đa dạng khác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-hepco-green transition-colors">
                  <Award className="w-8 h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-3xl font-extrabold text-gray-900 mb-2">50+</h4>
                <p className="text-gray-500 font-medium">Năm kinh nghiệm</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-hepco-green transition-colors">
                  <Users className="w-8 h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-3xl font-extrabold text-gray-900 mb-2">500+</h4>
                <p className="text-gray-500 font-medium">Đối tác & Khách hàng</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-hepco-green transition-colors">
                  <Leaf className="w-8 h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-3xl font-extrabold text-gray-900 mb-2">100%</h4>
                <p className="text-gray-500 font-medium">Cam kết xanh</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-hepco-green transition-colors">
                  <CheckCircle2 className="w-8 h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-3xl font-extrabold text-gray-900 mb-2">Top 1</h4>
                <p className="text-gray-500 font-medium">Khu vực Miền Trung</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sơ đồ tổ chức */}
        {activeTab === 2 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-green-900 uppercase relative inline-block pb-3">
                Sơ đồ bộ máy tổ chức HEPCO
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-hepco-orange rounded-full"></div>
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm md:text-base">
                Cấu trúc sơ đồ tổ chức bộ máy điều hành, các phòng nghiệp vụ và các đơn vị xí nghiệp trực thuộc Công ty Cổ phần Môi trường và Công trình Đô thị Huế.
              </p>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 shadow-sm flex flex-col items-center justify-center p-4 md:p-8">
              <img 
                src="/images/organizational_chart.png" 
                alt="Sơ đồ tổ chức HEPCO" 
                className="w-full h-auto max-w-5xl object-contain shadow-md rounded-xl border border-gray-100 transition-transform duration-300 hover:scale-[1.01]"
              />
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {activeTab !== 0 && activeTab !== 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
            <Building2 className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nội dung đang được cập nhật</h3>
            <p className="text-gray-500">Thông tin chi tiết cho chuyên mục này sẽ sớm được bổ sung trong thời gian tới.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
