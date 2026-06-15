const Stats = () => {
  const statsData = [
    { number: '45+', label: 'Năm kinh nghiệm' },
    { number: '200+', label: 'Dự án' },
    { number: '500+', label: 'Khách hàng' },
    { number: '550+', label: 'Nhân sự' },
  ];

  return (
    <div className="relative z-20 -mt-16 pt-16 pb-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 overflow-hidden">
      {/* Curved top shape */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-px">
        <svg className="relative block w-full h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120 Q600,0 1200,120 L1200,0 L0,0 Z" fill="#3f9e4d"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statsData.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-1 tracking-tight">{stat.number}</span>
              <span className="text-base md:text-xl font-bold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
