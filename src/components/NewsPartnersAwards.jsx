import React from 'react';

const NewsPartnersAwards = () => {
  const news = [
    { title: 'Quy trình cấp phép đào lề, đục mương, đục hố ga, gửi nước thải sinh hoạt', date: '14-08-2023', author: 'Nhi Phan' },
    { title: 'TƯNG BỪNG NGÀY HỘI TÁI CHẾ - HUẾ 2023 ♻️♻️', date: '14-05-2023', author: 'Nhi Phan' },
    { title: 'LAN TOẢ THÔNG ĐIỆP BẢO VỆ MÔI TRƯỜNG TRONG GIẢI CHẠY QUY MÔ HƠN 10.000 NGƯỜI THAM DỰ TẠI HUẾ', date: '24-04-2023', author: 'Nhi Phan' },
  ];

  return (
    <section className="py-20 relative bg-white overflow-hidden">
      {/* Background shape */}
      <div className="absolute inset-0 z-0">
        <svg className="absolute w-full h-[150%] top-[-20%] right-[-30%] opacity-10 text-hepco-green" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* News Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tin tức nổi bật</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col group cursor-pointer hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gray-300 relative overflow-hidden">
                   <div className="absolute inset-0 bg-black/10 group-hover:scale-105 transition-transform duration-500"></div>
                   <div className="absolute bottom-[-16px] left-1/2 transform -translate-x-1/2 bg-hepco-green text-white text-xs font-bold py-1 px-4 rounded-full z-10 whitespace-nowrap">
                     {item.date}
                   </div>
                </div>
                <div className="p-8 pt-8 flex-grow flex flex-col">
                  <h3 className="text-hepco-orange font-bold text-lg mb-2 line-clamp-3 leading-snug group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-4">
                    {item.author} - Tin tức khác
                  </p>
                  <p className="text-gray-500 text-sm line-clamp-3 mt-auto">
                    Mô tả ngắn gọn về bài viết tin tức để người đọc nắm bắt thông tin...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 inline-block relative">
              Đối tác & Khách hàng
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-hepco-orange"></div>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {/* Logos Placeholders */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400">Logo 1</div>
            <div className="w-32 h-16 bg-gray-200 flex items-center justify-center font-bold text-gray-400">Logo 2</div>
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400">Logo 3</div>
            <div className="w-40 h-12 bg-gray-200 flex items-center justify-center font-bold text-gray-400">Logo 4</div>
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400">Logo 5</div>
          </div>
        </div>

        {/* Awards Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Thành tích & Khen thưởng</h2>
          </div>
          <div className="flex justify-center gap-6 overflow-x-auto pb-8">
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center">Bằng khen 1</div>
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center">Bằng khen 2</div>
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center">Bằng khen 3</div>
             <div className="w-64 h-80 bg-yellow-100 border-4 border-yellow-300 rounded shadow-md flex-shrink-0 flex items-center justify-center">Bằng khen 4</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsPartnersAwards;
