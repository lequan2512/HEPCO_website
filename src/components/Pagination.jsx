import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ meta, onPageChange, hideTotal = false, size = 'md', showSinglePage = true }) => {
  if (!meta || meta.total === 0) return null;
  if (meta.totalPages <= 1 && !showSinglePage) return null;

  const { page, totalPages, total } = meta;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} flex items-center justify-center rounded-lg font-medium transition-colors ${
            page === i
              ? 'bg-hepco-green text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between bg-white border-t border-gray-200 ${size === 'sm' ? 'px-2 py-2' : 'px-4 py-3 sm:px-6'}`}>
      {!hideTotal && (
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Hiển thị tổng cộng <span className="font-semibold text-hepco-green">{total}</span> kết quả
          </p>
        </div>
      )}
      <div className="flex flex-wrap flex-1 justify-center sm:justify-end items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang đầu"
          >
            <ChevronsLeft className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang trước"
          >
            <ChevronLeft className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang sau"
          >
            <ChevronRight className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Trang cuối"
          >
            <ChevronsRight className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
