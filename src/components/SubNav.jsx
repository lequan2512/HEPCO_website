const SubNav = ({ items, activeIndex, onSelect }) => {
  return (
    <div className="w-full flex justify-center -mt-6 relative z-20">
      <div className="bg-white rounded shadow-lg overflow-hidden flex border border-gray-100">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect && onSelect(index)}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-r last:border-r-0 border-gray-100
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
