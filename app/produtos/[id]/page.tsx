import { ProductInfo } from "@/src/components/produtos/ProductInfo";
import type { Brand, Category } from "@/src/data/products";
import { db } from "@/src/lib/prisma";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description:
      product.description ||
      `Compre ${product.name} na Iron Distribuidora. Peças originais e com garantia.`,
    openGraph: {
      images: [product.imageUrl, ...previousImages],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  // Map Prisma product to frontend Product type
  const mappedProduct = {
    ...product,
    brand: product.brand as Brand,
    category: product.category as Category,
    restockDate: product.restockDate
      ? product.restockDate.toISOString()
      : undefined,
    description: product.description || undefined,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    description:
      product.description || `Compre ${product.name} na Iron Distribuidora.`,
    sku: product.code,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `https://irondistribuidorasc.com.br/produtos/${product.id}`,
      priceCurrency: "BRL",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    // Placeholder for reviews since we don't have them yet
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "1",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href="/"
                className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
              >
                Início
              </Link>
            </li>
            <li>
              <span className="text-slate-300 dark:text-slate-600">/</span>
            </li>
            <li>
              <Link
                href="/produtos"
                className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
              >
                Produtos
              </Link>
            </li>
            <li>
              <span className="text-slate-300 dark:text-slate-600">/</span>
            </li>
            <li>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Product Image Column */}
          <div className="lg:col-span-7">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-white p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  {product.brand}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Cód: {product.code}
                </span>
              </div>
              <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
                {product.name}
              </h1>
            </div>

            <ProductInfo product={mappedProduct} />

            <div className="prose prose-slate max-w-none dark:prose-invert">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Descrição
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
