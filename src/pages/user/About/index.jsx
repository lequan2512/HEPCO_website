import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Award,
  Leaf,
  Building2,
  Users,
  CheckCircle2,
  ZoomIn,
  X,
  MoveHorizontal,
  FileCheck,
  Download,
  History,
  Briefcase,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PageBanner from '../../../components/PageBanner';
import SubNav from '../../../components/SubNav';
import PdfFlipbook from '../../../components/PdfFlipbook';
import { getAboutPages, getAboutSettings } from '../../../services/news.service';
import { sanitizeLegacyHtml, resolveAssetUrl } from '../../../utils/assetUrl';

const About = () => {
  const location = useLocation();
  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const [prevLocationKey, setPrevLocationKey] = useState(location.key);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [pdfModal, setPdfModal] = useState(null); // { url, fileName, title, subtitle }
  const subNavItems = ['Về Hepco', 'Chức năng - Giấy phép', 'Sơ đồ tổ chức', 'Hồ sơ năng lực'];

  const aboutConfig = getAboutSettings();
  const aboutPages = getAboutPages();
  const historyPage = aboutPages.find((p) => Number(p.id) === 49) || aboutPages[1];
  const functionsPage = aboutPages.find((p) => Number(p.id) === 48) || aboutPages[0];

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
        title={aboutConfig.bannerTitle || 'Giới thiệu'}
        description={aboutConfig.bannerDescription}
      />
      <SubNav items={subNavItems} activeIndex={activeTab} onSelect={setActiveTab} />

      <div className="container mx-auto px-2.5 sm:px-4 mt-6 sm:mt-8 md:mt-12 max-w-8xl">

        {activeTab === 0 && (
          <div className="space-y-8 sm:space-y-12 md:space-y-16">
            {/* Open Letter Section */}
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Left Image */}
              <div className="w-full lg:w-5/12 relative group">
                <div className="absolute inset-0 bg-hepco-green rounded-2xl transform translate-x-2 sm:translate-x-4 translate-y-2 sm:translate-y-4 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl h-[300px] sm:h-[350px] md:h-[400px] border-4 border-white flex flex-col items-center justify-center">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${resolveAssetUrl(aboutConfig.hqImage || '/images/cover.png')})`
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="text-center p-4 sm:p-6 bg-white/90 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-500">
                        <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-hepco-green mx-auto mb-2" />
                        <h3 className="text-xl sm:text-2xl font-extrabold text-green-900">
                          {aboutConfig.hqTitle || 'Trụ sở HEPCO'}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1">
                          {aboutConfig.hqAddress || '46 Trần Phú, TP. Huế'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="w-full lg:w-7/12 bg-white p-5 sm:p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-xl relative border border-gray-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0 opacity-50"></div>

                <div className="relative z-10">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-green-900 uppercase relative inline-block pb-3">
                    {aboutConfig.openLetterTitle || 'Thư Ngỏ'}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-hepco-orange rounded-full"></div>
                  </h2>

                  <div className="prose prose-sm sm:prose-base md:prose-lg text-gray-700 space-y-4 sm:space-y-6 text-justify">
                    <p className="italic font-bold text-hepco-green text-lg sm:text-xl mt-4 mb-3">
                      {aboutConfig.openLetterGreeting || 'Kính gửi Quý khách hàng,'}
                    </p>
                    <p className="leading-relaxed">{aboutConfig.openLetterParagraph1}</p>
                    <p className="leading-relaxed">{aboutConfig.openLetterParagraph2}</p>
                    <div className="bg-green-50 p-4 sm:p-6 rounded-xl border-l-4 border-hepco-green my-4 sm:my-6 shadow-sm">
                      <p className="font-semibold text-green-900 mb-0">
                        {aboutConfig.openLetterHighlight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Đối tác &amp; Khách hàng</p>
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
                <h4 className="text-xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">Hàng Đầu</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Khu vực Miền Trung</p>
              </div>
            </div>

            {/* Official History & Company Profile from hepco.com.vn/GioiThieu/Lich-su-hinh-thanh_49 */}
            {historyPage && (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-hepco-green">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-green-900 uppercase">
                      {historyPage.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Thông tin chính thức về quá trình hình thành, cơ cấu lãnh đạo và quy mô quản lý của HEPCO
                    </p>
                  </div>
                </div>
                <div
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isHistoryExpanded ? 'max-h-none' : 'max-h-[420px]'
                  }`}
                >
                  <div
                    className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-gray-700 leading-relaxed prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto"
                    dangerouslySetInnerHTML={{ __html: sanitizeLegacyHtml(historyPage.content) }}
                  />
                  {!isHistoryExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={() => setIsHistoryExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-hepco-green hover:text-white bg-emerald-50 hover:bg-hepco-green border border-emerald-200 transition-all cursor-pointer shadow-2xs"
                  >
                    {isHistoryExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Thu gọn nội dung Lịch sử hình thành</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Xem đầy đủ Lịch sử hình thành &amp; Danh sách các đơn vị trực thuộc</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Chức năng - Giấy phép */}
        {activeTab === 1 && (
          <div className="space-y-6 sm:space-y-8">
            {/* Section Header */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-3xl font-extrabold text-green-900 uppercase relative inline-block pb-3">
                  Chức năng - Giấy phép hoạt động
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-hepco-orange rounded-full"></div>
                </h2>
                <p className="text-gray-600 mt-3 max-w-3xl mx-auto text-xs sm:text-sm md:text-base px-2">
                  Công ty Cổ phần Môi trường và Công trình Đô thị Huế (HEPCO) được cấp đầy đủ các giấy phép môi trường theo quy định của pháp luật, đảm bảo hoạt động hợp pháp và tuân thủ nghiêm ngặt các tiêu chuẩn về bảo vệ môi trường.
                </p>
              </div>

              {/* Permit Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Card 1: GPMT 317 */}
                <div
                  onClick={() => setPdfModal({ url: '/pdf/7. 317-GP-BTNMT_Signed.pdf', fileName: '317-GPMT-BTNMT.pdf', title: 'Giấy phép Môi trường số 317/GPMT-BTNMT', subtitle: 'Bộ Tài nguyên và Môi trường' })}
                  className="group bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 sm:p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-emerald-200 group-hover:bg-hepco-green group-hover:border-hepco-green transition-colors duration-300">
                      <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 text-hepco-green group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-green-900 mb-1">Giấy phép Môi trường</h3>
                      <p className="text-lg sm:text-xl font-black text-hepco-green">Số 317/GPMT-BTNMT</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1.5">Cấp bởi: <span className="font-semibold text-gray-800">Bộ Tài nguyên và Môi trường</span></p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center gap-4 flex-wrap">
                    <a
                      href="/pdf/7. 317-GP-BTNMT_Signed.pdf"
                      download="317-GPMT-BTNMT.pdf"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-hepco-green hover:text-emerald-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </a>
                  </div>
                </div>

                {/* Card 2: GPMT 48 */}
                <div
                  onClick={() => setPdfModal({ url: '/pdf/7. 48-GP-UBND_Signed (TTH).pdf', fileName: '48-GPMT-UBND.pdf', title: 'Giấy phép Môi trường số 48/GPMT-UBND', subtitle: 'UBND thành phố Huế' })}
                  className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                      <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-green-900 mb-1">Giấy phép Môi trường</h3>
                      <p className="text-lg sm:text-xl font-black text-blue-600">Số 48/GPMT-UBND</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1.5">Cấp bởi: <span className="font-semibold text-gray-800">UBND thành phố Huế</span></p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center gap-4 flex-wrap">
                    <a
                      href="/pdf/7. 48-GP-UBND_Signed (TTH).pdf"
                      download="48-GPMT-UBND.pdf"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Tải xuống
                    </a>
                  </div>
                </div>
              </div>

              {/* Official Functions & Duties Content from hepco.com.vn/GioiThieu/Chuc-nang-nhiem-vu_48 */}
              {functionsPage && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-hepco-green">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg sm:text-2xl font-extrabold text-green-900 uppercase">
                      {functionsPage.title}
                    </h3>
                  </div>
                  <div
                    className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto"
                    dangerouslySetInnerHTML={{ __html: sanitizeLegacyHtml(functionsPage.content) }}
                  />
                </div>
              )}
            </div>

            {/* PDF Preview Modal */}
            {pdfModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4" onClick={() => setPdfModal(null)}>
                <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
                    <div>
                      <h3 className="font-extrabold text-green-900 text-sm sm:text-lg uppercase">{pdfModal.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{pdfModal.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={pdfModal.url}
                        download={pdfModal.fileName}
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-hepco-green hover:text-emerald-700 transition-colors bg-green-50 px-3 py-1.5 rounded-lg border border-green-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tải xuống
                      </a>
                      <button
                        onClick={() => setPdfModal(null)}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </div>
                  {/* Modal Body - PDF Viewer */}
                  <div className="flex-1 overflow-hidden p-2 sm:pt-2 sm:px-2">
                    <PdfFlipbook
                      pdfUrl={pdfModal.url}
                      fileName={pdfModal.fileName}
                      title={pdfModal.title}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sơ đồ tổ chức */}
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
                    src={resolveAssetUrl(aboutConfig.orgChartImage || '/images/organizational_chart.png')}
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

        {/* Tab 4: Hồ sơ năng lực (3D Book PDF Reader) */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-2.5 sm:p-4 md:p-5">
              <div className="text-center mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-3xl font-extrabold text-green-900 uppercase relative inline-block pb-3">
                  HỒ SƠ NĂNG LỰC HEPCO
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-hepco-orange rounded-full"></div>
                </h2>
              </div>

              <PdfFlipbook
                pdfUrl={resolveAssetUrl(aboutConfig.capabilityPdfUrl || '/pdf/HoSoNangLuc2026.pdf')}
                fileName={aboutConfig.capabilityPdfName || 'Hồ_Sơ_Năng_Lực_HEPCO_2026.pdf'}
              />
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {activeTab !== 0 && activeTab !== 1 && activeTab !== 2 && activeTab !== 3 && (
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
