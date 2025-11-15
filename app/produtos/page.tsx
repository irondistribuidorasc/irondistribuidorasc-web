"use client";

import { ProductFilters } from "@/src/components/produtos/ProductFilters";
import { ProductGrid } from "@/src/components/produtos/ProductGrid";
import { ProductSearch } from "@/src/components/produtos/ProductSearch";
import { Pagination } from "@/src/components/produtos/Pagination";
import { useProductFilters } from "@/src/hooks/useProductFilters";
import mockProductsRaw from "@/src/data/mockProducts.json";
import { validateProducts } from "@/src/lib/validateProducts";
import Link from "next/link";

// Validação do JSON importado
const allProducts = validateProducts(mockProductsRaw);

export default function ProdutosPage() {
  const {
    paginatedProducts,
    totalProducts,
    totalPages,
    currentPage,
    itemsPerPage,
    setPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    filters,
    setSearchQuery,
    toggleBrand,
    toggleCategory,
    setInStockOnly,
    clearFilters,
    hasActiveFilters,
  } = useProductFilters(allProducts);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 flex text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Início
                </Link>
              </li>
              <li>
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              </li>
              <li>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  Produtos
                </span>
              </li>
            </ol>
          </nav>

          {/* Título e descrição */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
              Nossos Produtos
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Peças de celular de qualidade para sua assistência técnica.
              Adicione ao carrinho e finalize seu pedido via WhatsApp.
            </p>
          </div>

          {/* Barra de busca */}
          <div className="mt-6">
            <ProductSearch
              value={filters.searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por nome, código ou modelo..."
            />
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Sidebar de filtros - Desktop */}
          <div className="lg:w-64 lg:flex-shrink-0">
            <ProductFilters
              selectedBrands={filters.brands}
              selectedCategories={filters.categories}
              inStockOnly={filters.inStockOnly}
              onToggleBrand={toggleBrand}
              onToggleCategory={toggleCategory}
              onToggleInStock={setInStockOnly}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              totalProducts={totalProducts}
            />
          </div>

          {/* Grid de produtos */}
          <div className="flex-1">
            {/* Header com ordenação */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ordenado por <span className="font-semibold">Mais Relevância</span>
              </p>
            </div>

            {/* Grid */}
            <ProductGrid products={paginatedProducts} />

            {/* Paginação */}
            {totalProducts > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProducts}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onFirstPage={goToFirstPage}
                onLastPage={goToLastPage}
                onNextPage={goToNextPage}
                onPreviousPage={goToPreviousPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

