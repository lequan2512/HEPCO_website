const CoreValues = () => {
  const values = [
    { letter: 'H', title: 'Honesty', color: 'text-green-500' },
    { letter: 'E', title: 'Eco-responsibility', color: 'text-green-500' },
    { letter: 'P', title: 'Professionalism', color: 'text-green-500' },
    { letter: 'C', title: 'Community', color: 'text-green-500' },
    { letter: 'O', title: 'Optimization', color: 'text-green-500' },
  ];

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-br from-green-500 via-hepco-green to-green-900 overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-green-500/30 mix-blend-multiply"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-center w-48 sm:w-56 transform transition-all duration-500 hover:-translate-y-3 hover:scale-105 border border-gray-50 hover:border-green-100 group">
              <span className={`text-6xl sm:text-8xl font-black mb-3 sm:mb-4 ${v.color} drop-shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                {v.letter}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-gray-900 text-center uppercase tracking-wide">
                {v.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
