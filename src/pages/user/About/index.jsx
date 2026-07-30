import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Award, Leaf, Building2, Users, CheckCircle2, ZoomIn, X, MoveHorizontal } from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import SubNav from '../../../components/SubNav';

const About = () => {
  const location = useLocation();
  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const [prevLocationKey, setPrevLocationKey] = useState(location.key);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const subNavItems = ['Về Hepco', 'Chức năng - Giấy phép', 'Sơ đồ tổ chức', 'Thành tựu đạt được', 'Hồ sơ năng lực', 'Thư viện ảnh'];

  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key);
    setUserSelectedTab(null);
  }

  const tabFromState = (location.state && typeof location.state.tab === 'number') ? location.state.tab : 0;
  const activeTab = userSelectedTab !== null ? userSelectedTab : tabFromState;
  const setActiveTab = setUserSelectedTab;

  return (
    <div className="bg-gray-50 pb-20 min-h-screen">
      <PageBanner
        title="Giới thiệu"
        description="Tiền thân là phòng quản lý đô thị và nhà đất được ra đời năm 1975, trải qua quá trình hình thành và phát triển với nhiều cột mốc thay đổi, năm 2015 Công ty trách nhiệm hữu hạn nhà nước Môi trường và Công trình Đô thị Huế trở thành Công ty Cổ phần Môi trường và Công trình đô thị Huế cho đến nay. Là doanh nghiệp nhà nước chi phối 51% cổ phần với bộ máy tổ chức gồm 05 phòng nghiệp vụ và 13 đơn vị xí nghiệp trực thuộc. Hepco là đơn vị uy tín hàng đầu miền Trung hoạt động trong lĩnh vực vệ sinh môi trường và công trình đô thị với gần 500 khách hàng, đối tác trên địa bàn toàn tỉnh Thừa Thiên Huế."
      />
      <SubNav items={subNavItems} activeIndex={activeTab} onSelect={setActiveTab} />

      <div className="container mx-auto px-2.5 sm:px-4 mt-6 sm:mt-8 md:mt-12 max-w-8xl">

        {activeTab === 0 && (
          <div className="space-y-8 sm:space-y-12 md:space-y-20">
            {/* Open Letter Section */}
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Left Image */}
              <div className="w-full lg:w-5/12 relative group">
                <div className="absolute inset-0 bg-hepco-green rounded-2xl transform translate-x-2 sm:translate-x-4 translate-y-2 sm:translate-y-4 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl h-[300px] sm:h-[350px] md:h-[400px] border-4 border-white flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-[url('/images/cover.png')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="text-center p-4 sm:p-6 bg-white/90 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-500">
                        <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-hepco-green mx-auto mb-2" />
                        <h3 className="text-xl sm:text-2xl font-extrabold text-green-900">Trụ sở HEPCO</h3>
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">46 Trần Phú, TP. Huế</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="w-full lg:w-7/12 bg-white p-5 sm:p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-xl relative border border-gray-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0 opacity-50"></div>

                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-900 mb-4 sm:mb-6 inline-block relative pb-2 sm:pb-3 uppercase">
                    Thư ngỏ
                    <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-1 bg-hepco-orange rounded-full"></div>
                  </h2>

                  <div className="prose prose-sm sm:prose-base md:prose-lg text-gray-700 space-y-4 sm:space-y-6 text-justify">
                    <p className="italic font-bold text-hepco-green text-lg sm:text-xl">Kính gửi Quý khách hàng,</p>
                    <p className="leading-relaxed">
                      Chúng tôi trân trọng gửi lời chào và sự biết ơn sâu sắc đến Quý khách hàng đã tin tưởng và ủng hộ <strong className="text-green-800">Công ty Cổ Phần Môi trường và Công trình đô thị Huế (HEPCO)</strong> trong suốt thời gian qua. Với bề dày gần <span className="bg-yellow-100 px-1 font-bold text-orange-600 rounded">50 năm kinh nghiệm</span>, cùng với đội ngũ nhân sự luôn tận tụy và hệ thống phương tiện thiết bị tiên tiến, chúng tôi khẳng định hoàn toàn đáp ứng mọi yêu cầu của Quý khách hàng trong lĩnh vực vệ sinh môi trường và công trình đô thị.
                    </p>
                    <p className="leading-relaxed">
                      Trên suốt chặng đường hình thành và phát triển, HEPCO không chỉ là một đối tác được chính quyền đô thị địa phương tín nhiệm giao nhiệm vụ, đặt hàng và thực hiện đấu thầu mà còn là đối tác đáng tin cậy của các tổ chức, doanh nghiệp và cá nhân trong lĩnh vực thu gom, vận chuyển, và xử lý chất thải trên địa bàn tỉnh Thừa Thiên Huế.
                    </p>
                    <div className="bg-green-50 p-4 sm:p-6 rounded-xl border-l-4 border-hepco-green my-4 sm:my-6 shadow-sm">
                      <p className="font-semibold text-green-900 mb-0">
                        Ngoài thực hiện các công tác ở lĩnh vực vệ sinh môi trường, chúng tôi còn thực hiện thi công hệ thống điện chiếu sáng đô thị và trang trí đường phố, cũng như các công trình thoát nước, xây dựng hạ tầng, dân dụng và các lĩnh vực kinh doanh đa dạng khác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pb-6 sm:pb-8">
              <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-hepco-green transition-colors">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">50+</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Năm kinh nghiệm</p>
              </div>
              <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-hepco-green transition-colors">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">500+</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Đối tác & Khách hàng</p>
              </div>
              <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-hepco-green transition-colors">
                  <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">100%</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Cam kết xanh</p>
              </div>
              <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-hepco-green transition-colors">
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-hepco-green group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">Top 1</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Khu vực Miền Trung</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sơ đồ tổ chức */}
        {activeTab === 2 && (
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-3 sm:p-5 md:p-8">
            <div className="text-center mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-3xl font-extrabold text-green-900 uppercase relative inline-block pb-3">
                Sơ đồ bộ máy tổ chức HEPCO
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-hepco-orange rounded-full"></div>
              </h2>
              <p className="text-gray-600 mt-2 sm:mt-3 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2">
                Cấu trúc sơ đồ tổ chức bộ máy điều hành, các phòng nghiệp vụ và các đơn vị xí nghiệp trực thuộc Công ty Cổ phần Môi trường và Công trình Đô thị Huế.
              </p>
            </div>

            {/* Mobile scroll hint */}
            <div className="md:hidden flex items-center justify-between bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-lg mb-2.5 border border-emerald-100">
              <span className="flex items-center gap-1.5">
                <MoveHorizontal className="w-4 h-4 text-emerald-600 animate-pulse" />
                Vuốt ngang để xem chi tiết
              </span>
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="flex items-center gap-1 text-hepco-orange hover:underline font-bold"
              >
                <ZoomIn className="w-4 h-4" /> Phóng to
              </button>
            </div>

            {/* Scrollable image container */}
            <div className="relative w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50/50 shadow-xs p-1 sm:p-2 md:p-3 lg:p-6 custom-scrollbar">
              <div
                onClick={() => setIsImageModalOpen(true)}
                className="min-w-[750px] md:min-w-0 w-full cursor-zoom-in group relative rounded-lg overflow-hidden"
              >
                <img
                  src="/images/organizational_chart.png"
                  alt="Sơ đồ tổ chức HEPCO"
                  className="w-full h-auto max-w-5xl mx-auto object-contain shadow-md rounded-xl border border-gray-100 transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="bg-black/75 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <ZoomIn className="w-4 h-4" /> Nhấn để xem toàn màn hình
                  </span>
                </div>
              </div>
            </div>

            {/* Fullscreen Image Modal */}
            {isImageModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4" onClick={() => setIsImageModalOpen(false)}>
                <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl p-2 sm:p-4 shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center pb-2 mb-2 border-b px-2 shrink-0">
                    <h3 className="font-bold text-gray-800 text-xs sm:text-base">Sơ đồ bộ máy tổ chức HEPCO</h3>
                    <button
                      onClick={() => setIsImageModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <div className="overflow-auto flex-1 p-1 sm:p-2 custom-scrollbar flex">
                    <img
                      src="/images/organizational_chart.png"
                      alt="Sơ đồ tổ chức HEPCO"
                      className="min-w-[750px] sm:min-w-0 w-full h-auto object-contain max-h-none sm:max-h-[85vh] m-auto"
                    />
                  </div>
                </div>
              </div>
            )}
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
