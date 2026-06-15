import React from 'react';

const CoreValues = () => {
  const values = [
    { letter: 'H', text: 'TRUNG THỰC', color: 'text-green-500' },
    { letter: 'E', text: 'TRÁCH NHIỆM\nMÔI TRƯỜNG', color: 'text-green-500' },
    { letter: 'P', text: 'CHUYÊN NGHIỆP', color: 'text-green-500' },
    { letter: 'C', text: 'TƯƠNG TÁC\nCỘNG ĐỒNG', color: 'text-green-500' },
    { letter: 'O', text: 'GIẢI PHÁP TỐI ƯU', color: 'text-green-500' },
  ];

  return (
    <section className="relative py-20 bg-hepco-green overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-green-900/30 mix-blend-multiply"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-wrap justify-center gap-6">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center justify-center w-56 transform transition hover:-translate-y-2">
              <span className={`text-7xl font-black mb-4 ${v.color} drop-shadow-md`}>
                {v.letter}
              </span>
              <span className="text-sm font-bold text-gray-700 text-center uppercase whitespace-pre-line leading-tight">
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
