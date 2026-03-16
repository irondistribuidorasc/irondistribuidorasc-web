"use client";

import { getPageRange } from "@/src/lib/productUtils";
import { Button } from "@heroui/react";

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
      className="flex flex-col items-center gap-4 border-t border-divider px-4 py-6 sm:px-6"
      aria-label="Navegação de páginas"
    >
      {/* Informação de itens */}
      <div className="text-sm text-default-600">
        Mostrando{" "}
        <span className="font-semibold">
          {startItem}-{endItem}
        </span>{" "}
        de <span className="font-semibold">{totalItems}</span> produtos
      </div>

      {/* Botões de navegação */}
      <div className="flex items-center gap-2">
        {/* Primeira página */}
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          onPress={onFirstPage}
          isDisabled={currentPage === 1}
          aria-label="Primeira página"
          className="min-w-10 border-divider text-default-600"
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
        </Button>

        {/* Página anterior */}
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          onPress={onPreviousPage}
          isDisabled={currentPage === 1}
          aria-label="Página anterior"
          className="min-w-10 border-divider text-default-600"
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
        </Button>

        {/* Números de página - Desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          {desktopPages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "solid" : "bordered"}
              color={page === currentPage ? "primary" : "default"}
              size="sm"
              onPress={() => onPageChange(page)}
              isDisabled={page === currentPage}
              className={`min-w-10 ${
                page === currentPage
                  ? "bg-brand-600 text-white"
                  : "border-divider text-default-600"
              }`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Números de página - Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          {mobilePages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "solid" : "bordered"}
              color={page === currentPage ? "primary" : "default"}
              size="sm"
              onPress={() => onPageChange(page)}
              isDisabled={page === currentPage}
              className={`min-w-10 ${
                page === currentPage
                  ? "bg-brand-600 text-white"
                  : "border-divider text-default-600"
              }`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Próxima página */}
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          onPress={onNextPage}
          isDisabled={currentPage === totalPages}
          aria-label="Próxima página"
          className="min-w-10 border-divider text-default-600"
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
        </Button>

        {/* Última página */}
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          onPress={onLastPage}
          isDisabled={currentPage === totalPages}
          aria-label="Última página"
          className="min-w-10 border-divider text-default-600"
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
        </Button>
      </div>
    </nav>
  );
}

