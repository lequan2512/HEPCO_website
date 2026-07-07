const CoreValues = () => {
  const values = [
    { letter: 'H', text: 'TRUNG THỰC', color: 'text-green-500' },
    { letter: 'E', text: 'TRÁCH NHIỆM\nMÔI TRƯỜNG', color: 'text-green-500' },
    { letter: 'P', text: 'CHUYÊN NGHIỆP', color: 'text-green-500' },
    { letter: 'C', text: 'TƯƠNG TÁC\nCỘNG ĐỒNG', color: 'text-green-500' },
    { letter: 'O', text: 'GIẢI PHÁP TỐI ƯU', color: 'text-green-500' },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-green-500 via-hepco-green to-green-900 overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-green-500/30 mix-blend-multiply"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-wrap justify-center gap-6">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 flex flex-col items-center justify-center w-56 transform transition-all duration-500 hover:-translate-y-4 hover:scale-105 border border-gray-50 hover:border-green-100">
              <span className={`text-7xl font-black mb-4 ${v.color} drop-shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                {v.letter}
              </span>
              <span className="text-sm font-extrabold text-gray-800 text-center uppercase whitespace-pre-line leading-relaxed tracking-wider">
                {v.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
