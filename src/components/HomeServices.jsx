import React from 'react';

const HomeServices = () => {
  const services = [
    { title: 'Thu gom vận chuyển xử lý rác sinh hoạt' },
    { title: 'Thu gom vận chuyển xử lý rác nguy hại' },
    { title: 'Cơ khí - Xây dựng công trình hạ tầng kỹ thuật đô thị' },
    { title: 'Thoát nước - Điện chiếu sáng' },
    { title: 'Quản lý nghĩa trang nhân dân' },
    { title: 'Kinh doanh khác' },
  ];

  return (
    <section className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 inline-block relative">
            Dịch vụ của chúng tôi
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-hepco-orange"></div>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Quote Box */}
          <div className="lg:w-1/3 relative mt-16 lg:mt-0">
            {/* Image extending out of the box */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-4/5 h-48 bg-gray-300 rounded-t-xl z-10 border-4 border-white shadow-lg overflow-hidden flex items-end justify-center">
               <div className="w-16 h-16 bg-hepco-green rounded-full border-4 border-white mb-2 absolute -bottom-8"></div>
            </div>
            
            <div className="bg-hepco-green rounded-xl p-8 pt-40 text-white shadow-xl h-full relative">
              <span className="text-6xl text-yellow-400 font-serif absolute top-32 left-8">"</span>
              <p className="text-lg leading-relaxed mt-4 text-justify relative z-10">
                HEPCO với kinh nghiệm gần 50 năm kinh nghiệm trong lĩnh vực vệ sinh môi trường và công trình đô thị sẽ cung cấp đến quý khách hàng các dịch vụ với chất lượng tốt nhất, uy tín nhất. Cam kết luôn đồng hành cùng quý khách hàng trong hành trình bảo vệ môi trường và phát triển bền vững.
              </p>
            </div>
          </div>

          {/* Right Services Grid */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <div key={index} className="group relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer">
                  {/* Placeholder image background */}
                  <div className="absolute inset-0 bg-gray-400 transition-transform duration-500 group-hover:scale-110"></div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-center">
                    <h3 className="text-white font-bold text-lg drop-shadow-md transition-colors group-hover:text-yellow-400">
                      {service.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeServices;
