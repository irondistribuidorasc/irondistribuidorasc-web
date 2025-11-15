"use client";

import { getPageRange } from "@/src/lib/productUtils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Páginas visíveis: 5 no desktop, 3 no mobile
  const desktopPages = getPageRange(currentPage, totalPages, 5);
  const mobilePages = getPageRange(currentPage, totalPages, 3);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex flex-col items-center gap-4 border-t border-slate-200 px-4 py-6 dark:border-slate-700 sm:px-6"
      aria-label="Navegação de páginas"
    >
      {/* Informação de itens */}
      <div className="text-sm text-slate-700 dark:text-slate-300">
        Mostrando{" "}
        <span className="font-semibold">
          {startItem}-{endItem}
        </span>{" "}
        de <span className="font-semibold">{totalItems}</span> produtos
      </div>

      {/* Botões de navegação */}
      <div className="flex items-center gap-2">
        {/* Primeira página */}
        <button
          onClick={onFirstPage}
          disabled={currentPage === 1}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Primeira página"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Página anterior */}
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Página anterior"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Números de página - Desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          {desktopPages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              className={`min-w-[40px] rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                page === currentPage
                  ? "border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-500"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Números de página - Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          {mobilePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={page === currentPage}
              className={`min-w-[40px] rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                page === currentPage
                  ? "border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-500"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Próxima página */}
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Próxima página"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Última página */}
        <button
          onClick={onLastPage}
          disabled={currentPage === totalPages}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Última página"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

