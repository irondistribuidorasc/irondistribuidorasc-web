"use client";

import { useState, memo } from "react";
import type { Brand, Category } from "@/src/data/products";
import { brandOptions, categoryOptions } from "@/src/data/products";
import { Button } from "@heroui/react";
import { ChevronDownIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";

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
        <h3 className="text-sm font-semibold text-foreground">
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="light"
            size="sm"
            onPress={onClearFilters}
            className="h-auto min-w-0 px-0 text-xs font-medium text-brand-600 dark:text-brand-400"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Total de produtos */}
      <div className="rounded-lg bg-default-100 px-4 py-4">
        <p className="text-sm text-default-600">
          <span className="font-bold">{totalProducts}</span>{" "}
          {totalProducts === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </div>

      {/* Disponibilidade */}
      <div className="border-b border-divider pb-4">
        <Button
          variant="light"
          fullWidth
          onPress={() => toggleSection("availability")}
          className="h-auto justify-between px-0 text-sm font-semibold text-foreground"
          aria-expanded={expandedSections.has("availability")}
          endContent={
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform ${
                expandedSections.has("availability") ? "rotate-180" : ""
              }`}
            />
          }
        >
          Disponibilidade
        </Button>

        {expandedSections.has("availability") && (
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm text-default-600">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleInStock(e.target.checked)}
                className="h-4 w-4 rounded border-divider text-brand-600 focus:ring-2 focus:ring-brand-500"
              />
              <span>Apenas em estoque</span>
            </label>
          </div>
        )}
      </div>

      {/* Marcas */}
      <div className="border-b border-divider pb-4">
        <Button
          variant="light"
          fullWidth
          onPress={() => toggleSection("brands")}
          className="h-auto justify-between px-0 text-sm font-semibold text-foreground"
          aria-expanded={expandedSections.has("brands")}
          endContent={
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform ${
                expandedSections.has("brands") ? "rotate-180" : ""
              }`}
            />
          }
        >
          <span className="flex items-center">
            Marcas
            {selectedBrands.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                {selectedBrands.length}
              </span>
            )}
          </span>
        </Button>

        {expandedSections.has("brands") && (
          <div className="mt-4 space-y-2">
            {brandOptions.map((brand) => (
              <label
                key={brand.key}
                className="flex items-center gap-2 text-sm text-default-600"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.key)}
                  onChange={() => onToggleBrand(brand.key)}
                  className="h-4 w-4 rounded border-divider text-brand-600 focus:ring-2 focus:ring-brand-500"
                />
                <span>{brand.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="pb-4">
        <Button
          variant="light"
          fullWidth
          onPress={() => toggleSection("categories")}
          className="h-auto justify-between px-0 text-sm font-semibold text-foreground"
          aria-expanded={expandedSections.has("categories")}
          endContent={
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform ${
                expandedSections.has("categories") ? "rotate-180" : ""
              }`}
            />
          }
        >
          <span className="flex items-center">
            Categorias
            {selectedCategories.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                {selectedCategories.length}
              </span>
            )}
          </span>
        </Button>

        {expandedSections.has("categories") && (
          <div className="mt-4 space-y-2">
            {categoryOptions.map((category) => (
              <label
                key={category.key}
                className="flex items-center gap-2 text-sm text-default-600"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.key)}
                  onChange={() => onToggleCategory(category.key)}
                  className="h-4 w-4 rounded border-divider text-brand-600 focus:ring-2 focus:ring-brand-500"
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
      <Button
        variant="bordered"
        fullWidth
        onPress={() => setIsMobileOpen(true)}
        className="border-divider text-default-600 lg:hidden"
        aria-label="Abrir filtros"
        startContent={<FunnelIcon className="h-5 w-5" />}
      >
        Filtros
        {hasActiveFilters && (
          <span className="inline-flex items-center rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">
            {selectedBrands.length + selectedCategories.length + (inStockOnly ? 1 : 0)}
          </span>
        )}
      </Button>

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
          <div className="fixed inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-divider px-4 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Filtros
              </h2>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsMobileOpen(false)}
                aria-label="Fechar filtros"
                className="text-default-400"
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>
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
            <div className="border-t border-divider px-4 py-4">
              <Button
                color="primary"
                fullWidth
                onPress={() => setIsMobileOpen(false)}
                className="bg-brand-600 font-semibold text-white hover:bg-brand-700"
              >
                Ver {totalProducts} {totalProducts === 1 ? "produto" : "produtos"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:block" aria-label="Filtros de produtos">
        <div className="sticky top-4 rounded-lg border border-divider bg-background p-6">
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

