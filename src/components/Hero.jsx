import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative w-full h-[700px] bg-[#3f9e4d] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-700/60 to-[#3f9e4d]/90 mix-blend-multiply z-0"></div>
      
      {/* Subtle particle/light effects to mimic the glowing orbs in the design */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-300 rounded-full blur-[80px]"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-yellow-400 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Slider Controls */}
      <button className="absolute left-4 md:left-8 z-30 w-12 h-12 bg-black/40 rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-colors">
        <ChevronLeft className="w-8 h-8" />
      </button>
      
      <button className="absolute right-4 md:right-8 z-30 w-12 h-12 bg-black/40 rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-colors">
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center mt-[-180px] w-full px-4">
        <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-wide mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          CÁM ƠN QUÝ KHÁCH HÀNG
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center mt-2 relative">
          <span className="text-[#f26522] font-[cursive] text-6xl md:text-[5.5rem] md:-rotate-12 md:-mr-4 drop-shadow-md z-10 md:translate-y-4">
            Đã đồng hành
          </span>
          <span 
            className="text-[#f26522] font-black text-6xl md:text-[7rem] tracking-tight uppercase"
            style={{ 
               WebkitTextStroke: '3px white', 
               textShadow: '0 8px 0px rgba(0,0,0,0.2), 0 15px 10px rgba(0,0,0,0.3)' 
            }}
          >
            CÙNG HEPCO
          </span>
        </div>
      </div>

      {/* Foreground Illustrations Placeholder */}
      <div className="absolute bottom-0 w-full flex justify-center items-end px-10 h-72 z-10 pointer-events-none">
        <div className="relative w-full max-w-5xl h-full flex items-end justify-center">
            {/* Truck placeholder */}
            <div className="w-[500px] h-[220px] bg-gray-200 rounded-t-3xl border-4 border-gray-300 relative translate-x-40 shadow-2xl">
               <div className="absolute right-0 bottom-0 w-[220px] h-[160px] bg-orange-400 rounded-tr-xl"></div>
               {/* Wheels */}
               <div className="absolute bottom-[-25px] left-12 w-20 h-20 bg-gray-800 rounded-full border-4 border-gray-400 shadow-lg flex items-center justify-center">
                 <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
               </div>
               <div className="absolute bottom-[-25px] right-24 w-20 h-20 bg-gray-800 rounded-full border-4 border-gray-400 shadow-lg flex items-center justify-center">
                 <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
               </div>
               {/* Logo on truck */}
               <div className="absolute inset-0 flex items-center justify-center pr-20">
                  <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center text-hepco-green font-bold text-3xl border-8 border-green-600 shadow-inner">HEPCO</div>
               </div>
            </div>
            {/* Characters placeholder */}
            <div className="absolute left-20 md:left-32 bottom-0 flex space-x-6">
              {/* Male Character */}
              <div className="w-32 h-[300px] bg-[#00a651] rounded-t-[60px] shadow-xl flex flex-col items-center pt-8 border-x-4 border-t-4 border-[#007f3d] relative z-20">
                 <div className="w-24 h-24 bg-[#ffcc99] rounded-full mb-4 shadow-inner"></div>
                 <div className="text-white text-sm font-bold bg-white/20 px-4 py-1 rounded-full">HEPCO</div>
                 {/* Helmet */}
                 <div className="absolute -top-6 w-28 h-16 bg-[#3cb878] rounded-t-full"></div>
              </div>
              {/* Female Character */}
              <div className="w-32 h-[280px] bg-[#00a651] rounded-t-[60px] shadow-xl flex flex-col items-center pt-8 border-x-4 border-t-4 border-[#007f3d] mt-8 relative z-10">
                 <div className="w-24 h-24 bg-[#ffcc99] rounded-full mb-4 shadow-inner flex items-center justify-center">
                    <div className="w-16 h-8 bg-black/10 rounded-full mt-2"></div> {/* glasses */}
                 </div>
                 <div className="text-white text-sm font-bold bg-white/20 px-4 py-1 rounded-full">HEPCO</div>
                 {/* Helmet */}
                 <div className="absolute -top-6 w-28 h-16 bg-[#3cb878] rounded-t-full"></div>
                 {/* Waving Hand */}
                 <div className="absolute top-32 -right-12 w-12 h-20 bg-[#ffcc99] rounded-full transform rotate-45 shadow-md"></div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
