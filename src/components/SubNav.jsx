const SubNav = ({ items, activeIndex, onSelect }) => {
  return (
    <div className="w-full flex justify-center -mt-6 relative z-20 px-2 md:px-4">
      <div className="bg-white rounded shadow-lg overflow-x-auto flex border border-gray-100 max-w-full no-scrollbar">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect && onSelect(index)}
            className={`whitespace-nowrap px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-semibold transition-colors border-r last:border-r-0 border-gray-100
              ${index === activeIndex ? 'text-hepco-orange' : 'text-gray-700 hover:text-hepco-green'}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubNav;
