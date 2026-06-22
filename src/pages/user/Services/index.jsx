import { useState } from 'react';
import PageBanner from '../../../components/PageBanner';
import SubNav from '../../../components/SubNav';

const Services = () => {
  const [activeTab, setActiveTab] = useState(0);
  const subNavItems = [
    'Thu gom vận chuyển xử lý rác sinh hoạt', 
    'Thu gom vận chuyển xử lý rác nguy hại', 
    'Cơ khí - Xây dựng', 
    'Thoát nước - Điện chiếu sáng', 
    'Quản trang', 
    'Kinh doanh khác'
  ];

  return (
    <div className="bg-gray-50 pb-20">
      <PageBanner 
        title="Dịch vụ"
        description="Với quá trình hình thành và phát triển, bề dày gần 50 năm trong lĩnh vực vệ sinh môi trường và công trình đô thị, cùng đội ngũ cán bộ quản lý giàu kinh nghiệm, đội ngũ nhân viên người lao động lành nghề và hệ thống cơ sở vật chất phương tiện thiết bị hiện đại chúng tôi đã đang và sẽ cung cấp đến quý khách hàng các dịch vụ với chất lượng tốt nhất, uy tín nhất. Cam kết luôn đồng hành cùng quý khách hàng trong hành trình bảo vệ môi trường và phát triển bền vững."
      />
      <SubNav items={subNavItems} activeIndex={activeTab} onSelect={setActiveTab} />
      
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        <h2 className="text-3xl font-bold text-hepco-green text-center mb-12">
          {subNavItems[activeTab]}
        </h2>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Image Placeholder */}
          <div className="w-full lg:w-5/12 h-[500px] bg-gray-200 rounded-lg overflow-hidden shadow-lg relative flex items-center justify-center border border-gray-300">
             {/* Typically an image goes here */}
             <span className="text-gray-400 font-bold text-xl px-4 text-center">Hình ảnh Dịch Vụ<br/>(Nhân viên đang làm việc)</span>
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-7/12">
            <div className="prose prose-sm md:prose-base text-gray-700 space-y-4 text-justify">
              <p>
                <strong>HEPCO</strong> tự hào là đơn vị đạt tiêu chuẩn chất lượng ISO 9001:2015 trong lĩnh vực thu gom, vận chuyển và xử lý rác thải, hiện là đơn vị chủ lực cung cấp dịch vụ thu gom, vận chuyển, xử lý rác thải sinh hoạt tại các chủ nguồn thải, hộ gia đình, khu dân cư, trung tâm thương mại, cơ quan, trường học, doanh nghiệp, khu công nghiệp trên địa bàn thành phố Huế và các Huyện Thị xã trên địa bàn tỉnh Thừa Thiên Huế.
              </p>
              <p>
                Với năng lực hơn 500 công nhân trực tiếp, 80 xe vận chuyển rác đời mới, hệ thống xe cuốn ép, thùng container hiện đại, xe quét đường, xe rửa đường và nhiều chủng loại xe máy, thiết bị khác đáp ứng tiêu chuẩn kỹ thuật hiện đại, <strong>HEPCO</strong> đảm bảo năng lực vận chuyển khoảng 500 tấn rác thải sinh hoạt/ngày, xử lý trên 500 tấn rác/ngày bằng phương pháp chôn lấp hợp vệ sinh. Hoạt động thu gom vận chuyển được điều hành thông qua hệ thống Camera, GPS và Trung tâm giám sát thông minh. Bên cạnh đó, việc thực hiện chương trình phân loại chất thải rắn sinh hoạt tại nguồn giúp <strong>HEPCO</strong> có đủ năng lực, kinh nghiệm trong công tác tổ chức thu gom, vận chuyển, xử lý chất thải sau phân loại đúng quy định.
              </p>
              <p className="font-semibold pt-4">Hoạt động của chúng tôi bao gồm:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dịch vụ vệ sinh công cộng</li>
                <li>Dịch vụ thu gom, vận chuyển, xử lý rác thải sinh hoạt</li>
                <li>Dịch vụ thu gom, vận chuyển, xử lý rác cồng kềnh</li>
                <li>Dịch vụ thu gom, vận chuyển rác xây dựng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
