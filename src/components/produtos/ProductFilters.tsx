"use client";

import { useState, memo } from "react";
import type { Brand, Category } from "@/src/data/products";
import { brandOptions, categoryOptions } from "@/src/data/products";

type FilterContentProps = {
  selectedBrands: Brand[];
  selectedCategories: Category[];
  inStockOnly: boolean;
  onToggleBrand: (brand: Brand) => void;
  onToggleCategory: (category: Category) => void;
  onToggleInStock: (inStock: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalProducts: number;
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
};

const FilterContent = memo(function FilterContent({
  selectedBrands,
  selectedCategories,
  inStockOnly,
  onToggleBrand,
  onToggleCategory,
  onToggleInStock,
  onClearFilters,
  hasActiveFilters,
  totalProducts,
  expandedSections,
  toggleSection,
}: FilterContentProps) {
  return (
    <div className="space-y-4">
      {/* Header com contador e botão limpar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Total de produtos */}
      <div className="rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-700">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-bold">{totalProducts}</span>{" "}
          {totalProducts === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </div>

      {/* Disponibilidade */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
        <button
          onClick={() => toggleSection("availability")}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100"
          aria-expanded={expandedSections.has("availability")}
        >
          <span>Disponibilidade</span>
          <svg
            className={`h-5 w-5 transition-transform ${
              expandedSections.has("availability") ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.has("availability") && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleInStock(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700"
              />
              <span>Apenas em estoque</span>
            </label>
          </div>
        )}
      </div>

      {/* Marcas */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
        <button
          onClick={() => toggleSection("brands")}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100"
          aria-expanded={expandedSections.has("brands")}
        >
          <span>
            Marcas
            {selectedBrands.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                {selectedBrands.length}
              </span>
            )}
          </span>
          <svg
            className={`h-5 w-5 transition-transform ${
              expandedSections.has("brands") ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.has("brands") && (
          <div className="mt-3 space-y-2">
            {brandOptions.map((brand) => (
              <label
                key={brand.key}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.key)}
                  onChange={() => onToggleBrand(brand.key)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700"
                />
                <span>{brand.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100"
          aria-expanded={expandedSections.has("categories")}
        >
          <span>
            Categorias
            {selectedCategories.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                {selectedCategories.length}
              </span>
            )}
          </span>
          <svg
            className={`h-5 w-5 transition-transform ${
              expandedSections.has("categories") ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expandedSections.has("categories") && (
          <div className="mt-3 space-y-2">
            {categoryOptions.map((category) => (
              <label
                key={category.key}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.key)}
                  onChange={() => onToggleCategory(category.key)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700"
                />
                <span>{category.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

type ProductFiltersProps = {
  selectedBrands: Brand[];
  selectedCategories: Category[];
  inStockOnly: boolean;
  onToggleBrand: (brand: Brand) => void;
  onToggleCategory: (category: Category) => void;
  onToggleInStock: (inStock: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  totalProducts: number;
};

export function ProductFilters({
  selectedBrands,
  selectedCategories,
  inStockOnly,
  onToggleBrand,
  onToggleCategory,
  onToggleInStock,
  onClearFilters,
  hasActiveFilters,
  totalProducts,
}: ProductFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["brands", "categories", "availability"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Botão mobile para abrir drawer */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
        aria-label="Abrir filtros"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filtros
        {hasActiveFilters && (
          <span className="inline-flex items-center rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
            {selectedBrands.length + selectedCategories.length + (inStockOnly ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Drawer mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros de produtos"
        >
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Filtros
              </h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label="Fechar filtros"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <FilterContent
                selectedBrands={selectedBrands}
                selectedCategories={selectedCategories}
                inStockOnly={inStockOnly}
                onToggleBrand={onToggleBrand}
                onToggleCategory={onToggleCategory}
                onToggleInStock={onToggleInStock}
                onClearFilters={onClearFilters}
                hasActiveFilters={hasActiveFilters}
                totalProducts={totalProducts}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-700">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Ver {totalProducts} {totalProducts === 1 ? "produto" : "produtos"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:block" aria-label="Filtros de produtos">
        <div className="sticky top-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <FilterContent
            selectedBrands={selectedBrands}
            selectedCategories={selectedCategories}
            inStockOnly={inStockOnly}
            onToggleBrand={onToggleBrand}
            onToggleCategory={onToggleCategory}
            onToggleInStock={onToggleInStock}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
            totalProducts={totalProducts}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        </div>
      </aside>
    </>
  );
}

