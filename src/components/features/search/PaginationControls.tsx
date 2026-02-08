"use client";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const getPageNumbers = () => {
    const pagesToShow = [];
    const maxPages = 5;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
    } else {
      pagesToShow.push(1);
      if (currentPage > 3) pagesToShow.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pagesToShow.push(i);

      if (currentPage < totalPages - 2) pagesToShow.push("...");
      pagesToShow.push(totalPages);
    }

    return pagesToShow;
  };

  return (
    <div className="join my-8 flex justify-center">
      <button
        className="join-item btn"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          className={`join-item btn ${page === currentPage ? "btn-active" : ""}`}
          onClick={() => typeof page === "number" && onPageChange?.(page)}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}

      <button
        className="join-item btn"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
