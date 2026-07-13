'use client';
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  // if page is one hide pagination
  if (totalPages <= 1) return null;

  // ─── Page Numbers Generator Logic ────────────────────────────────────────
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // click page limit
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      if (startPage > 2) pages.push('dots-start');
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages - 1) pages.push('dots-end');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl mt-6">
      {/* Left side: Status Text */}
      <p className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
        Showing Page <span className="text-slate-900 font-semibold">{currentPage}</span> of{' '}
        <span className="text-slate-900 font-semibold">{totalPages}</span>{' '}
        <span className="block sm:inline">({totalCount} total items)</span>
      </p>

      {/* Right side: Controls */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-w-full">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, idx) => {
          if (typeof page === 'string') {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 shrink-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 sm:w-9 sm:h-9 text-[11px] sm:text-xs font-semibold rounded-xl transition shrink-0 ${
                isCurrent
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-600 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}