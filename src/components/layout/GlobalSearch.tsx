"use client";

import {
  type SearchResult,
  searchProducts,
} from "@/app/actions/search-products";
import { logger } from "@/src/lib/logger";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { status, data: session } = useSession();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const stopNavbarKeyCapture = (e: KeyboardEvent) => e.stopPropagation();
    document.addEventListener("mousedown", handleClickOutside);
    el.addEventListener("keydown", stopNavbarKeyCapture);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      el.removeEventListener("keydown", stopNavbarKeyCapture);
    };
  }, []);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const products = await searchProducts(query);
        setResults(products);
        setIsOpen(true);
      } catch (error) {
        logger.error("Error fetching search results:", { error });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/produtos?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/produtos");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const renderDropdownContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-default-400 text-sm">
          Buscando...
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="p-4 text-center text-default-400 text-sm">
          Nenhum produto encontrado.
        </div>
      );
    }

    return (
      <ul>
        {results.map((product) => (
          <li
            key={product.id}
            className="border-b border-divider last:border-0"
          >
            <Link
              href={`/produtos/${product.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 hover:bg-default-100 transition-colors"
            >
              <div className="h-10 w-10 flex-shrink-0 relative bg-default-100 rounded-md overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-xs text-slate-400">
                    N/A
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-default-400">
                  <span>{product.brand}</span>
                  {status === "authenticated" && session?.user?.approved && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-brand-600 dark:text-brand-400">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
        <li className="p-2 bg-default-100 text-center">
          <button
            type="button"
            onClick={(e) => handleSearch(e)}
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            Ver todos os resultados
          </button>
        </li>
      </ul>
    );
  };

  return (
    <div className="w-full md:max-w-lg relative" ref={containerRef}>
      <form onSubmit={handleSearch} className="w-full">
        <Input
          type="search"
          placeholder="Buscar produtos..."
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            if (!isOpen && value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2 && results.length > 0) setIsOpen(true);
          }}
          onClear={() => {
            setQuery("");
            setResults([]);
            setIsOpen(false);
          }}
          isClearable
          variant="bordered"
          radius="full"
          size="sm"
          startContent={
            <MagnifyingGlassIcon
              className="h-4 w-4 text-default-400"
              aria-hidden="true"
            />
          }
          classNames={{
            inputWrapper: "border-default-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500",
          }}
        />
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-content1 rounded-xl shadow-xl border border-divider overflow-hidden z-50">
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}

export function GlobalSearch() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-lg h-9 bg-slate-100 rounded-full animate-pulse" />
      }
    >
      <SearchInput />
    </Suspense>
  );
}
