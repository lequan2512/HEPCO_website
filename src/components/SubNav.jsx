const SubNav = ({ items, activeIndex, onSelect }) => {
  return (
    <div className="w-full flex justify-center -mt-6 relative z-20 px-2 md:px-4">
      <div className="relative max-w-full">
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto flex border border-gray-100 max-w-full scrollbar-none px-1">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelect && onSelect(index)}
              className={`whitespace-nowrap px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-semibold transition-colors border-r last:border-r-0 border-gray-100 shrink-0 ${
                index === activeIndex
                  ? 'text-hepco-orange bg-orange-50/50'
                  : 'text-gray-700 hover:text-hepco-green hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        {/* Right fade hint on mobile */}
        <div className="md:hidden absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/90 to-transparent pointer-events-none rounded-r-lg" />
      </div>
    </div>
  );
};

export default SubNav;
