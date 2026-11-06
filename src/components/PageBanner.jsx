const PageBanner = ({ title, description, bgImage }) => {
  return (
    <div className="relative w-full py-8 sm:py-10 md:py-14 bg-hepco-green flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-green-900/40 mix-blend-multiply"></div>

      {/* Actual background image could be placed here if available */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 md:mb-2 drop-shadow-md">{title}</h1>
        <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed opacity-90 text-center max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageBanner;
