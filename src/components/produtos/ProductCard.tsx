"use client";

import { useCart } from "@/src/contexts/CartContext";
import type { PublicProduct } from "@/src/data/products";
import { formatPrice, formatRestockDate } from "@/src/lib/productUtils";
import { hasVisiblePrice } from "@/src/lib/product-visibility";
import { Button } from "@heroui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ProductCardProps = {
  product: PublicProduct;
};

const FEEDBACK_DURATION_MS = 600;

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { data: session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!session?.user;
  const isApproved = session?.user?.approved === true;
  const canViewPrices = isAuthenticated && isApproved && hasVisiblePrice(product);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!canViewPrices) {
      return;
    }

    setIsAdding(true);
    addItem(product);
    openCart();

    // Feedback visual temporário com cleanup
    timeoutRef.current = setTimeout(() => {
      setIsAdding(false);
      timeoutRef.current = null;
    }, FEEDBACK_DURATION_MS);
  };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-lg border border-divider bg-content1 transition-all hover:-translate-y-1 hover:shadow-lg"
      aria-label={`Produto: ${product.name}`}
    >
      {/* Badge de disponibilidade */}
      {!product.inStock && (
        <div className="absolute left-2 top-2 z-10 rounded-md bg-error-500 px-2 py-1 text-xs font-semibold text-white">
          Fora de estoque
        </div>
      )}

      {/* Imagem do produto */}
      <Link
        href={`/produtos/${product.id}`}
        className="relative aspect-square w-full overflow-hidden bg-default-100"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>

      {/* Informações do produto */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Código */}
        <p className="text-xs font-mono text-default-400">
          {product.code}
        </p>

        {/* Nome */}
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          <Link href={`/produtos/${product.id}`} className="transition-colors hover:underline">
            {product.name}
          </Link>
        </h3>

        {/* Marca e categoria */}
        <div className="flex flex-wrap gap-1 text-xs text-default-500">
          <span className="rounded bg-default-100 px-2 py-0.5">
            {product.brand}
          </span>
        </div>

        {/* Preço ou Badge de Login/Aprovação */}
        {canViewPrices ? (
          <p className="mt-auto text-lg font-bold text-brand-600 dark:text-brand-400">
            {formatPrice(product.price)}
          </p>
        ) : isAuthenticated && !isApproved ? (
          <Link
            href="/conta-pendente"
            className="mt-auto inline-block rounded-md bg-yellow-100 px-4 py-2 text-center text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
          >
            Aguardando aprovação
          </Link>
        ) : (
          <Link
            href="/login?callbackUrl=/produtos"
            className="mt-auto inline-block rounded-md bg-brand-100 px-4 py-2 text-center text-sm font-medium text-brand-700 transition-colors hover:bg-brand-200 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
          >
            Disponível na área de clientes
          </Link>
        )}

        {/* Data de reestoque se fora de estoque */}
        {!product.inStock && product.restockDate && (
          <p className="text-xs text-default-400">
            Previsão: {formatRestockDate(product.restockDate)}
          </p>
        )}

        {/* Botão adicionar ao carrinho */}
        <Button
          fullWidth
          color="primary"
          onPress={handleAddToCart}
          isDisabled={!canViewPrices || !product.inStock || isAdding}
          className="mt-2 bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          aria-label={
            product.inStock
              ? `Adicionar ${product.name} ao carrinho`
              : `${product.name} fora de estoque`
          }
        >
          {isAdding
            ? "Adicionado!"
            : !canViewPrices
            ? "Acesso restrito"
            : product.inStock
            ? "Adicionar ao carrinho"
            : "Indisponível"}
        </Button>
      </div>
    </article>
  );
}
