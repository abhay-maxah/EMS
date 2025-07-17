const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('start-ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('end-ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-xl border border-gray-300 shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-40"
      >
        ←
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200
              ${currentPage === page
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-300 hover:bg-gray-100'
              }`}
          >
            {page}
          </button>
        ) : (
            <span
              key={index}
              className="w-10 h-10 flex items-center justify-center text-gray-400"
            >
            ...
          </span>
        )
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-xl border border-gray-300 shadow-sm transition-all duration-200 hover:bg-gray-100 disabled:opacity-40"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
