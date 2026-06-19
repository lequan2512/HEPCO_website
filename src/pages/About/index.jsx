import { useState } from 'react';
import PageBanner from '../../components/PageBanner';
import SubNav from '../../components/SubNav';

const About = () => {
  const [activeTab, setActiveTab] = useState(0);
  const subNavItems = ['Về Hepco', 'Chức năng - Giấy phép', 'Sơ đồ tổ chức', 'Thành tựu đạt được', 'Hồ sơ năng lực', 'Thư viện ảnh'];

  return (
    <div className="bg-gray-50 pb-20">
      <PageBanner 
        title="Giới thiệu"
        description="Tiền thân là phòng quản lý đô thị và nhà đất được ra đời năm 1975, trải qua quá trình hình thành và phát triển với nhiều cột mốc thay đổi, năm 2015 Công ty trách nhiệm hữu hạn nhà nước Môi trường và Công trình Đô thị Huế trở thành Công ty Cổ phần Môi trường và Công trình đô thị Huế cho đến nay. Là doanh nghiệp nhà nước chi phối 51% cổ phần với bộ máy tổ chức gồm 05 phòng nghiệp vụ và 13 đơn vị xí nghiệp trực thuộc. Hepco là đơn vị uy tín hàng đầu miền Trung hoạt động trong lĩnh vực vệ sinh môi trường và công trình đô thị với gần 500 khách hàng, đối tác trên địa bàn toàn tỉnh Thừa Thiên Huế."
      />
      <SubNav items={subNavItems} activeIndex={activeTab} onSelect={setActiveTab} />
      
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left Image Placeholder */}
          <div className="w-full md:w-5/12 bg-gray-200 rounded-lg overflow-hidden shadow-lg h-96 relative flex items-center justify-center border border-gray-300">
            {/* Typically an image goes here `<img src={truSo} alt="Trụ sở" className="w-full h-full object-cover" />` */}
            <span className="text-gray-400 font-bold text-xl">Hình ảnh Trụ Sở HEPCO</span>
          </div>

          {/* Right Content */}
          <div className="w-full md:w-7/12">
            <h2 className="text-4xl font-['cursive'] text-hepco-green mb-8">Thư ngỏ</h2>
            
            <div className="prose prose-sm md:prose-base text-gray-700 space-y-4 text-justify">
              <p className="italic font-semibold">Kính gửi Quý khách hàng,</p>
              <p>
                Chúng tôi trân trọng gửi lời chào và sự biết ơn sâu sắc đến Quý khách hàng đã tin tưởng và ủng hộ Công ty Cổ Phần Môi trường và Công trình đô thị Huế (HEPCO) trong suốt thời gian qua. Với bề dày gần 50 năm kinh nghiệm, cùng với đội ngũ nhân sự luôn tận tụy và hệ thống phương tiện thiết bị tiên tiến, chúng tôi khẳng định hoàn toàn đáp ứng mọi yêu cầu của Quý khách hàng trong lĩnh vực vệ sinh môi trường và công trình đô thị.
              </p>
              <p>
                Trên suốt chặng đường hình thành và phát triển, HEPCO không chỉ là một đối tác được chính quyền đô thị địa phương tín nhiệm giao nhiệm vụ, đặt hàng và thực hiện đấu thầu mà còn là đối tác đáng tin cậy của các tổ chức, doanh nghiệp và cá nhân trong lĩnh vực thu gom, vận chuyển, và xử lý chất thải trên địa bàn tỉnh Thừa Thiên Huế. Ngoài thực hiện các công tác ở lĩnh vực vệ sinh môi trường, chúng tôi còn thực hiện thi công hệ thống điện chiếu sáng đô thị và trang trí đường phố, cũng như các công trình thoát nước, xây dựng hạ tầng, dân dụng và các lĩnh vực kinh doanh đa dạng khác.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
