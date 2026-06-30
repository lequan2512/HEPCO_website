import { useState } from 'react';
import { Target, Leaf, X } from 'lucide-react';

const VisionMission = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="py-20 relative bg-white overflow-hidden">
      {/* Background watermark/line art could be added here */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3f9e4d 0%, transparent 50%)' }}>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 inline-block relative">
              Tầm nhìn - Sứ mệnh
            </h2>

            <div className="space-y-12">
              {/* Vision */}
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded bg-green-50 flex-shrink-0 flex items-center justify-center text-hepco-green relative">
                  <Target className="w-10 h-10 relative z-10" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-hepco-orange rounded-full z-0 opacity-50"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-hepco-green mb-3">Tầm nhìn</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Phát huy thế mạnh và đa dạng hóa lĩnh vực hoạt động để trở thành Công ty môi trường hàng đầu khu vực miền Trung - Tây nguyên.
                  </p>
                </div>
              </div>

              {/* Mission */}
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded bg-green-50 flex-shrink-0 flex items-center justify-center text-hepco-green relative">
                  <Leaf className="w-10 h-10 relative z-10" />
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-hepco-orange rounded-full z-0 opacity-50"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-hepco-green mb-3">Sứ mệnh</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Tạo ra giá trị bền vững cho môi trường và xã hội, mang đến một môi trường xanh - sạch - sáng cho cộng đồng là nhiệm vụ và sứ mệnh của Hepco.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Images */}
          <div className="lg:w-1/2 relative h-[300px] md:h-[500px] w-full flex justify-center items-center mt-8 lg:mt-0">
             {/* Play button overlay */}
             <div 
                onClick={() => setShowVideo(true)}
                className="absolute z-30 w-20 h-20 bg-hepco-green/80 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-hepco-green transition-colors shadow-xl backdrop-blur-sm"
             >
                <svg className="w-8 h-8 ml-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
             </div>
             
             {/* Image 1 (Left/Back) */}
             <div className="absolute left-0 top-10 w-2/3 h-4/5 bg-gray-300 rounded-lg overflow-hidden shadow-2xl border-4 border-white z-10 group">
                <img src="/images/news_planting.png" alt="Công viên đô thị" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             </div>
             
             {/* Image 2 (Right/Front) */}
             <div className="absolute right-0 bottom-10 w-2/3 h-4/5 bg-gray-300 rounded-lg overflow-hidden shadow-2xl border-4 border-white z-20 group">
                <img src="/images/news_trucks.png" alt="Xe thu gom rác" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative pt-[56.25%]">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/P7RZLoytEBI?autoplay=1"
                title="Giới thiệu HEPCO" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VisionMission;
